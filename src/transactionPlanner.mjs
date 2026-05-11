import { decimalTkasToSompi, sompiToTkas as formatSompiToTkas } from "./amounts.mjs";

const SOMPI_PER_TKAS = 100000000n;
const DEFAULT_MINER_FEE_SOMPI = 5000n;

export const DEFAULT_PLAN_INPUTS = Object.freeze({
  vaultFundingTkas: 25,
  vaultWithdrawalTkas: 5,
  assurancePledgeTkas: 250,
  minerFeeSompi: Number(DEFAULT_MINER_FEE_SOMPI)
});

export function normalizePlanInputs(input = {}) {
  return {
    vaultFundingTkas: clampNumber(Number(input.vaultFundingTkas), 0.00001, 100000000),
    vaultWithdrawalTkas: clampNumber(Number(input.vaultWithdrawalTkas), 0.00001, 100000000),
    assurancePledgeTkas: clampNumber(Number(input.assurancePledgeTkas), 0.00001, 100000000),
    minerFeeSompi: clampInteger(Number(input.minerFeeSompi), 1, 100000000)
  };
}

export function buildDryRunTransactionPlan({
  vaultArtifact,
  assuranceArtifact,
  vaultContractArtifact,
  assuranceContractArtifact,
  fundingOutpoint = null,
  inputs = {}
}) {
  const planInputs = normalizePlanInputs(inputs);
  const minerFeeSompi = BigInt(planInputs.minerFeeSompi);
  const vaultFundingSompi = tkasToSompi(planInputs.vaultFundingTkas);
  const vaultWithdrawalSompi = tkasToSompi(planInputs.vaultWithdrawalTkas);
  const assurancePledgeSompi = tkasToSompi(planInputs.assurancePledgeTkas);
  const vaultPolicy = vaultArtifact.policy;
  const assurance = assuranceArtifact.contract;
  const unlockTime = relativeUnixTime(vaultPolicy.withdrawalDelayHours);
  const deadline = relativeUnixTime(assurance.deadlineHours);
  const plannedAt = new Date().toISOString();

  return {
    schema: "tn12-covenant-transaction-plan/v1",
    network: "kaspa-testnet-12",
    status: "dry-run-not-signed-not-broadcast",
    plannedAt,
    inputs: {
      vaultFundingTkas: planInputs.vaultFundingTkas,
      vaultWithdrawalTkas: planInputs.vaultWithdrawalTkas,
      assurancePledgeTkas: planInputs.assurancePledgeTkas,
      minerFeeSompi: planInputs.minerFeeSompi,
      fundingOutpoint: fundingOutpoint ? summarizeFundingOutpoint(fundingOutpoint) : null
    },
    artifacts: {
      vaultPolicyId: vaultArtifact.policyId,
      vaultContract: summarizeContractArtifact(vaultContractArtifact),
      assuranceContract: summarizeContractArtifact(assuranceContractArtifact)
    },
    sharedPrerequisites: [
      "A faucet-funded kaspatest: address has been checked manually in the TN12 explorer.",
      "A public RPC, wallet connector, or lightweight transaction service is chosen for the first broadcast attempt.",
      "Address-to-pubkey derivation is resolved for contract constructor inputs.",
      "Transaction builder can serialize Silverscript contract outputs and entrypoint spends.",
      "Signer can produce signatures for the planned entrypoint paths."
    ],
    plans: [
      vaultFundingPlan({ vaultArtifact, vaultFundingSompi, minerFeeSompi, unlockTime }),
      vaultDelayedWithdrawalPlan({ vaultArtifact, vaultFundingSompi, vaultWithdrawalSompi, minerFeeSompi, unlockTime }),
      vaultRecoveryPlan({ vaultArtifact, vaultFundingSompi, minerFeeSompi, unlockTime }),
      assurancePledgePlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline }),
      assuranceReleasePlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline }),
      assuranceRefundPlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline })
    ],
    boundaries: [
      "This is a dry-run planner. It does not discover UTXOs, sign, submit, or prove anything on TN12.",
      "Vault and assurance are separate app lanes, but they reuse the same address, contract-artifact, transaction-builder, signer, broadcast, and explorer-verification plumbing.",
      "The current assurance contract artifact is an individual pledge primitive. Campaign target aggregation is app/planner-side until a refined pooled covenant or proof-backed design exists.",
      "ZK is not required for this first planner. Add it only after a plain TN12 covenant lifecycle works end-to-end."
    ]
  };
}

function summarizeFundingOutpoint(outpoint) {
  return {
    address: outpoint.address,
    txid: outpoint.txid || "",
    outputIndex: Number(outpoint.outputIndex || 0),
    amountTkas: Number(outpoint.amountTkas || 0),
    explorerUrl: outpoint.explorerUrl || "",
    status: outpoint.txid ? "exact-outpoint-entered" : "address-funded-outpoint-needed"
  };
}

function vaultFundingPlan({ vaultArtifact, vaultFundingSompi, minerFeeSompi, unlockTime }) {
  const policy = vaultArtifact.policy;

  return {
    id: "vault-funding",
    lane: "vault",
    purpose: "Create the covenant-controlled vault output.",
    contract: "DelayedRecoveryVault",
    entrypoint: null,
    status: "planner-ready-manual-funding-needed",
    from: "owner wallet UTXO",
    to: "DelayedRecoveryVault contract output",
    amount: amount(vaultFundingSompi),
    constructor: {
      owner: "owner pubkey derived from ownerAddress",
      recovery: "recovery pubkey derived from recoveryAddress",
      unlockTime,
      minerFee: Number(minerFeeSompi)
    },
    requiredInputs: [
      policy.ownerAddress,
      policy.recoveryAddress,
      "manually verified spendable owner wallet output",
      "compiled DelayedRecoveryVault artifact"
    ],
    expectedOutput: {
      type: "contract-output",
      value: amount(vaultFundingSompi),
      covenantIntent: "funds can only leave through the planned withdraw or recover path"
    },
    nextProof: "Explorer should show a TN12 transaction creating the vault output."
  };
}

function vaultDelayedWithdrawalPlan({ vaultArtifact, vaultFundingSompi, vaultWithdrawalSompi, minerFeeSompi, unlockTime }) {
  const policy = vaultArtifact.policy;
  const cappedWithdrawal = minBigInt(vaultWithdrawalSompi, tkasToSompi(policy.dailyLimitTkas));
  const changeSompi = vaultFundingSompi - cappedWithdrawal - minerFeeSompi;

  return {
    id: "vault-delayed-withdrawal",
    lane: "vault",
    purpose: "Spend from the vault after the configured delay.",
    contract: "DelayedRecoveryVault",
    entrypoint: "withdraw",
    status: changeSompi > 0n ? "planner-ready-broadcast-tool-needed" : "invalid-amount-for-demo-inputs",
    from: "funded DelayedRecoveryVault output",
    to: "owner-selected destination plus optional vault/change output",
    amount: amount(cappedWithdrawal),
    timing: {
      requiredTxTimeAtOrAfter: unlockTime,
      delayHours: policy.withdrawalDelayHours
    },
    requiredInputs: [
      "funded vault outpoint",
      "owner signature",
      "destination address",
      "transaction time at or after unlockTime"
    ],
    expectedOutputs: [
      {
        type: "recipient-output",
        value: amount(cappedWithdrawal)
      },
      {
        type: "remaining-vault-or-owner-change",
        value: amount(maxBigInt(changeSompi, 0n))
      }
    ],
    caveats: [
      "The current Silverscript withdraw path checks owner signature and tx.time; amount/change policy still belongs in the transaction builder/planner layer.",
      "A real builder should keep vault state explicit instead of relying on this JSON plan."
    ],
    nextProof: "Explorer should show the delayed spend after the unlock time."
  };
}

function vaultRecoveryPlan({ vaultArtifact, vaultFundingSompi, minerFeeSompi, unlockTime }) {
  const policy = vaultArtifact.policy;
  const recoveredSompi = vaultFundingSompi - minerFeeSompi;

  return {
    id: "vault-recovery",
    lane: "vault",
    purpose: "Move the full remaining vault value to the recovery key path.",
    contract: "DelayedRecoveryVault",
    entrypoint: "recover",
    status: recoveredSompi > 0n ? "planner-ready-broadcast-tool-needed" : "invalid-amount-for-demo-inputs",
    from: "funded DelayedRecoveryVault output",
    to: policy.recoveryAddress,
    amount: amount(maxBigInt(recoveredSompi, 0n)),
    timing: {
      unlockTimeIncludedInConstructor: unlockTime,
      contractRequiresDelayForRecovery: false
    },
    requiredInputs: [
      "funded vault outpoint",
      "recovery signature",
      "exact recovery P2PK output",
      "miner fee matching constructor value"
    ],
    expectedOutput: {
      type: "recovery-output",
      value: amount(maxBigInt(recoveredSompi, 0n)),
      address: policy.recoveryAddress
    },
    nextProof: "Explorer should show the vault output spent to the recovery lock."
  };
}

function assurancePledgePlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline }) {
  const contract = assuranceArtifact.contract;

  return {
    id: "assurance-pledge",
    lane: "assurance",
    purpose: "Create one contributor pledge output for a campaign.",
    contract: "AssurancePledge",
    entrypoint: null,
    status: "planner-ready-manual-funding-needed",
    from: "contributor wallet UTXO",
    to: "AssurancePledge contract output",
    amount: amount(assurancePledgeSompi),
    constructor: {
      contributor: "contributor pubkey derived from refundAddress",
      recipient: "recipient pubkey derived from recipientAddress",
      deadline,
      minerFee: Number(minerFeeSompi)
    },
    requiredInputs: [
      contract.refundAddress,
      contract.recipientAddress,
      "manually verified spendable contributor wallet output",
      "compiled AssurancePledge artifact"
    ],
    expectedOutput: {
      type: "contract-output",
      value: amount(assurancePledgeSompi),
      covenantIntent: "release to recipient or refund to contributor depending on campaign result/deadline handling"
    },
    nextProof: "Explorer should show one pledge output for the assurance contract."
  };
}

function assuranceReleasePlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline }) {
  const contract = assuranceArtifact.contract;
  const releaseSompi = assurancePledgeSompi - minerFeeSompi;

  return {
    id: "assurance-release",
    lane: "assurance",
    purpose: "Release an individual pledge to the recipient when campaign rules say the target is met.",
    contract: "AssurancePledge",
    entrypoint: "release",
    status: releaseSompi > 0n ? "planner-ready-broadcast-tool-needed" : "invalid-amount-for-demo-inputs",
    from: "funded AssurancePledge output",
    to: contract.recipientAddress,
    amount: amount(maxBigInt(releaseSompi, 0n)),
    timing: {
      deadline,
      contractCurrentlyEnforcesReleaseBeforeDeadline: false
    },
    requiredInputs: [
      "funded pledge outpoint",
      "campaign target aggregation proof or app-side release authorization",
      "exact recipient P2PK output",
      "miner fee matching constructor value"
    ],
    expectedOutput: {
      type: "recipient-output",
      value: amount(maxBigInt(releaseSompi, 0n)),
      address: contract.recipientAddress
    },
    caveats: [
      "Current AssurancePledge.release does not itself prove total campaign funding or deadline success.",
      "Use this only after the planner/app has decided the target condition is met."
    ],
    nextProof: "Explorer should show each pledge output released to the recipient."
  };
}

function assuranceRefundPlan({ assuranceArtifact, assurancePledgeSompi, minerFeeSompi, deadline }) {
  const contract = assuranceArtifact.contract;
  const refundSompi = assurancePledgeSompi - minerFeeSompi;

  return {
    id: "assurance-refund",
    lane: "assurance",
    purpose: "Refund an individual pledge to the contributor after the deadline.",
    contract: "AssurancePledge",
    entrypoint: "refund",
    status: refundSompi > 0n ? "planner-ready-broadcast-tool-needed" : "invalid-amount-for-demo-inputs",
    from: "funded AssurancePledge output",
    to: contract.refundAddress,
    amount: amount(maxBigInt(refundSompi, 0n)),
    timing: {
      requiredTxTimeAtOrAfter: deadline,
      deadlineHours: contract.deadlineHours
    },
    requiredInputs: [
      "funded pledge outpoint",
      "contributor signature",
      "transaction time at or after deadline",
      "exact contributor P2PK output",
      "miner fee matching constructor value"
    ],
    expectedOutput: {
      type: "contributor-refund-output",
      value: amount(maxBigInt(refundSompi, 0n)),
      address: contract.refundAddress
    },
    nextProof: "Explorer should show the pledge output refunded after the deadline."
  };
}

function summarizeContractArtifact(artifact) {
  return {
    contractName: artifact.contract_name,
    scriptBytes: Array.isArray(artifact.script) ? artifact.script.length : 0,
    constructorParams: artifact.ast?.params?.map((param) => ({
      name: param.name,
      type: param.type_ref?.base || "unknown"
    })) || [],
    entrypoints: artifact.ast?.functions?.map((fn) => fn.name) || []
  };
}

function amount(sompi) {
  return {
    sompi: sompi.toString(),
    tkas: sompiToTkas(sompi)
  };
}

export function tkasToSompi(value) {
  const sompi = decimalTkasToSompi(value);
  const maxSompi = 100000000n * SOMPI_PER_TKAS;
  return sompi > maxSompi ? maxSompi : sompi;
}

function sompiToTkas(sompi) {
  return formatSompiToTkas(sompi);
}

function relativeUnixTime(hoursFromNow) {
  return Math.floor(Date.now() / 1000) + Math.round(hoursFromNow * 3600);
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.round(value) : min;
  return Math.min(Math.max(number, min), max);
}

function clampNumber(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(number, min), max);
}

function minBigInt(left, right) {
  return left < right ? left : right;
}

function maxBigInt(left, right) {
  return left > right ? left : right;
}
