import { getKaspaWasmRuntime } from "./kaspaWasmRuntime.mjs";

export function buildRecurringTreasuryVaultLiveSubmitReadiness({
  ownerSigProof = {},
  contractOutpoint = {}
} = {}) {
  const covenantSupport = detectJsCovenantOutputSupport();
  const ownerSigPassed = ownerSigProof.status === "local-owner-sig-covenant-proof-passed";
  const acceptedFunding = contractOutpoint?.txid ? true : false;
  const ready = ownerSigPassed && acceptedFunding && covenantSupport.preservesCovenantOutput;

  return {
    schema: "tn12-recurring-treasury-vault-live-submit-readiness/v1",
    reviewedAt: "2026-05-12",
    status: ready ? "ready-for-live-submit-review" : "blocked-before-live-submit",
    target: "Spend the funded RecurringTreasuryVault output on TN12 with a covenant-bound continuation output.",
    currentEvidence: {
      ownerSigProof: ownerSigProof.status || null,
      acceptedFunding: contractOutpoint?.txid ? {
        txid: contractOutpoint.txid,
        outputIndex: contractOutpoint.outputIndex,
        amountSompi: contractOutpoint.amountSompi
      } : null,
      jsCovenantOutputSupport: covenantSupport
    },
    blocker: ready ? null : {
      id: "js-runtime-drops-output-covenant",
      status: "hard-blocker",
      detail: "The installed kaspa-wasm runtime does not preserve output.covenant in Transaction construction. Broadcasting through this route would lose the covenant-bound continuation output."
    },
    allowedNextAction: ready
      ? "Build a signed live-spend draft and review exact txid before submit."
      : "Use a Rust submit route or a JS SDK that preserves TransactionOutput.covenant before attempting live TN12 spend.",
    safetyRule: "Do not submit a recurring-vault spend candidate unless the constructed transaction preserves the continuation output covenant binding."
  };
}

export function detectJsCovenantOutputSupport() {
  const { Transaction } = getKaspaWasmRuntime().module;
  const covenantId = "11".repeat(32);
  const tx = new Transaction({
    version: 1,
    inputs: [],
    outputs: [{
      value: 1n,
      scriptPublicKey: "000051",
      covenant: {
        authorizingInput: 0,
        covenantId
      }
    }],
    lockTime: 0n,
    subnetworkId: "00".repeat(20),
    gas: 0n,
    payload: ""
  });
  const json = tx.toJSON();
  const output = json.outputs?.[0] || {};
  const covenant = output.covenant || output.inner?.covenant || null;
  tx.free?.();

  return {
    attemptedCovenant: { authorizingInput: 0, covenantId },
    preservesCovenantOutput: Boolean(covenant),
    runtimeOutputJsonKeys: Object.keys(output),
    observedCovenant: covenant,
    package: getKaspaWasmRuntime().metadata.package,
    version: getKaspaWasmRuntime().metadata.version
  };
}
