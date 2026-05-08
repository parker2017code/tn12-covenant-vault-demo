const OP_0 = 0x00;
const OP_1 = 0x51;
const OP_2 = 0x52;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;
const FINAL_SEQUENCE = "18446744073709551615";

const ENTRYPOINTS = {
  DelayedRecoveryVault: {
    withdraw: {
      selector: OP_0,
      signatures: ["ownerSig"],
      timeLocked: true,
      outputRole: "owner",
      sourceLines: "contracts/DelayedRecoveryVault.sil:9-17"
    },
    recover: {
      selector: OP_1,
      signatures: ["recoverySig"],
      timeLocked: false,
      outputRole: "recovery",
      sourceLines: "contracts/DelayedRecoveryVault.sil:19-26"
    }
  },
  AssurancePledge: {
    release: {
      selector: OP_0,
      signatures: [],
      timeLocked: false,
      outputRole: "recipient",
      sourceLines: "contracts/AssurancePledge.sil:9-18"
    },
    refund: {
      selector: OP_1,
      signatures: ["contributorSig"],
      timeLocked: true,
      outputRole: "contributor",
      sourceLines: "contracts/AssurancePledge.sil:20-28"
    }
  },
  Escrow: {
    release: {
      selector: OP_0,
      signatures: ["buyerSig"],
      timeLocked: false,
      outputRole: "seller",
      sourceLines: "contracts/Escrow.sil:8-15"
    },
    refund: {
      selector: OP_1,
      signatures: ["buyerSig"],
      timeLocked: true,
      outputRole: "buyer",
      sourceLines: "contracts/Escrow.sil:17-25"
    },
    cancel: {
      selector: OP_2,
      signatures: ["buyerSig", "sellerSig"],
      timeLocked: false,
      outputRole: "buyer",
      sourceLines: "contracts/Escrow.sil:27-36"
    }
  }
};

const ROLES = {
  DelayedRecoveryVault: ["owner", "recovery"],
  AssurancePledge: ["contributor", "recipient"],
  Escrow: ["buyer", "seller"]
};

export function buildCovenantAdversarialCoverage({
  proofFixture = {},
  drafts = [],
  compiledContracts = {},
  constructorArgs = {}
} = {}) {
  const cases = drafts.map((draftRecord) => buildCase({
    draftRecord,
    proofFixture,
    compiledContracts
  }));
  const roleSeparation = buildRoleSeparation(constructorArgs);
  const completeCases = cases.filter((item) => item.status === "local-adversarial-checks-covered");
  const roleSeparatedContracts = roleSeparation.contracts.filter((contract) => contract.rolesAreDistinct);
  const gaps = [
    ...cases.flatMap((item) => item.gaps),
    ...roleSeparation.contracts
      .filter((contract) => !contract.rolesAreDistinct)
      .map((contract) => `${contract.contract} constructor roles reuse the same public key in current fixtures.`)
  ];

  return {
    schema: "tn12-covenant-adversarial-coverage/v1",
    network: proofFixture.network || "kaspa-testnet-12",
    status: gaps.length
      ? "local-adversarial-coverage-with-open-gaps"
      : "local-adversarial-coverage-complete",
    summary: {
      acceptedProofSpends: proofFixture.transactions?.length || 0,
      localDraftCases: cases.length,
      coveredCases: completeCases.length,
      adversarialMutations: cases.reduce((total, item) => total + item.adversarialMutations.length, 0),
      roleSeparatedContracts: roleSeparatedContracts.length,
      roleSeparationGaps: roleSeparation.contracts.length - roleSeparatedContracts.length,
      openGaps: gaps.length
    },
    scope: [
      "These are local adversarial checks over signed draft shape, compiled redeem script, branch selector, output lock, amount, and input mass fields.",
      "They are not TN12 rejection submissions for intentionally invalid transactions.",
      "Accepted proof spends remain the happy-path network evidence; role-separated negative submissions are the next stronger evidence layer."
    ],
    roleSeparation,
    cases,
    gaps,
    nextActions: [
      {
        id: "role-separated-fixtures",
        detail: "Keep separate buyer/seller, owner/recovery, and contributor/recipient constructor fixtures current."
      },
      {
        id: "role-separated-tn12-proofs",
        detail: "Fund fresh role-separated contract outputs for the remaining mutually exclusive withdrawal, refund, and cancel spends."
      },
      {
        id: "invalid-submit-candidates",
        detail: "Build explicit wrong-signer, wrong-selector, wrong-output, and wrong-amount drafts for local review before any TN12 rejection attempt."
      }
    ]
  };
}

function buildCase({ draftRecord, proofFixture, compiledContracts }) {
  const draft = draftRecord.draft;
  const entrySpec = ENTRYPOINTS[draft.contract]?.[draft.entrypoint];
  const tx = draft.submitPayload.transaction;
  const input = tx.inputs[0];
  const output = tx.outputs[0];
  const parsed = parseSignatureScript(input.signatureScript);
  const acceptedProof = findAcceptedProof(proofFixture, draftRecord);
  const compiledScript = compiledContracts[draft.contract]?.script || [];
  const compiledScriptHex = bytesToHex(compiledScript);
  const sourceAmountSompi = BigInt(acceptedProof?.source?.amountSompi || decimalTkasToSompi(draft.source.amountTkas));
  const expectedOutputSompi = sourceAmountSompi - BigInt(draft.contractFeeSompi);
  const positiveChecks = {
    acceptedProofMapped: Boolean(acceptedProof),
    sourceOutpointMatchesAcceptedProof: Boolean(acceptedProof)
      && draft.source.txid === acceptedProof.source.txid
      && Number(draft.source.outputIndex) === Number(acceptedProof.source.outputIndex),
    outputAmountMatchesInputMinusFee: BigInt(output.amount) === expectedOutputSompi,
    destinationAmountMatchesOutput: BigInt(draft.destination.amountSompi) === BigInt(output.amount),
    outputScriptMatchesDestination: output.scriptPublicKey.scriptPublicKey === expectedP2pkScriptFromDraft(draft),
    redeemScriptMatchesCompiledContract: parsed.redeemScriptHex === compiledScriptHex,
    signatureArgumentCountMatchesEntrypoint: parsed.signaturePushes.length === entrySpec.signatures.length,
    selectorMatchesEntrypoint: parsed.selectorOpcode === entrySpec.selector,
    inputMassMatchesTxVersion: inputMassMatchesTxVersion(tx.version, input),
    timeLockShapeMatchesEntrypoint: entrySpec.timeLocked
      ? Number(tx.lockTime) > 0 && input.sequence === "0"
      : Number(tx.lockTime) === 0 && input.sequence === FINAL_SEQUENCE
  };
  const failedPositiveChecks = Object.entries(positiveChecks)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  const roleGap = draft.contract === "Escrow" && draft.entrypoint === "cancel"
    ? ["The historical escrow cancel proof has two signature arguments but reused buyer/seller keys; the role-separated lane now covers release and still needs fresh outputs for cancel."]
    : [];

  return {
    id: `${draft.lane}:${draft.entrypoint}`,
    acceptedTxid: acceptedProof?.txid || null,
    representativeDraftTxid: draft.transactionId,
    draftPath: draftRecord.path,
    contract: draft.contract,
    entrypoint: draft.entrypoint,
    sourceLines: entrySpec.sourceLines,
    status: failedPositiveChecks.length
      ? "local-positive-shape-mismatch"
      : "local-adversarial-checks-covered",
    positiveChecks,
    witnessShape: {
      selectorOpcode: opcodeName(parsed.selectorOpcode),
      signaturePushes: parsed.signaturePushes.length,
      expectedSignatures: entrySpec.signatures,
      redeemScriptBytes: parsed.redeemScriptHex.length / 2
    },
    scriptMapping: {
      compiledArtifact: `artifacts/${draft.contract}.json`,
      compiledScriptBytes: compiledScript.length,
      redeemScriptMatchesCompiledContract: positiveChecks.redeemScriptMatchesCompiledContract
    },
    adversarialMutations: buildMutations({ draft, entrySpec }),
    gaps: [...failedPositiveChecks, ...roleGap]
  };
}

function buildMutations({ draft, entrySpec }) {
  const mutations = [
    {
      id: "wrong-source-outpoint",
      localCheck: "sourceOutpointMatchesAcceptedProof",
      expectedFailure: "The spend would not consume the accepted contract instance."
    },
    {
      id: "wrong-output-amount",
      localCheck: "outputAmountMatchesInputMinusFee",
      expectedFailure: "The contract amount equality check would fail."
    },
    {
      id: "wrong-output-lock",
      localCheck: "outputScriptMatchesDestination",
      expectedFailure: `The contract output lock must pay the ${entrySpec.outputRole} P2PK script.`
    },
    {
      id: "wrong-entrypoint-selector",
      localCheck: "selectorMatchesEntrypoint",
      expectedFailure: "The P2SH stack would dispatch to the wrong entrypoint branch."
    }
  ];

  if (entrySpec.signatures.length > 0) {
    mutations.push({
      id: "missing-required-signature",
      localCheck: "signatureArgumentCountMatchesEntrypoint",
      expectedFailure: `The entrypoint expects ${entrySpec.signatures.join(", ")}.`
    });
  }
  if (entrySpec.timeLocked) {
    mutations.push({
      id: "missing-time-lock",
      localCheck: "timeLockShapeMatchesEntrypoint",
      expectedFailure: "The refund or withdrawal branch requires a nonzero lockTime and nonfinal sequence."
    });
  }
  if (draft.entrypoint === "cancel") {
    mutations.push({
      id: "single-party-cancel",
      localCheck: "signatureArgumentCountMatchesEntrypoint",
      expectedFailure: "The cancel branch expects buyerSig and sellerSig."
    });
  }
  return mutations;
}

function buildRoleSeparation(constructorArgs) {
  const contracts = Object.entries(ROLES).map(([contract, roles]) => {
    const args = constructorArgs[contract] || [];
    const publicKeys = roles.map((role, index) => ({
      role,
      xOnlyPublicKey: ctorArgToHex(args[index])
    }));
    const unique = new Set(publicKeys.map((key) => key.xOnlyPublicKey).filter(Boolean));
    return {
      contract,
      roles: publicKeys,
      rolesAreDistinct: unique.size === publicKeys.length
    };
  });

  return {
    status: contracts.every((contract) => contract.rolesAreDistinct)
      ? "roles-separated"
      : "role-separation-gaps",
    contracts
  };
}

function findAcceptedProof(proofFixture, draftRecord) {
  if (draftRecord.acceptedTxid) {
    return proofFixture.transactions?.find((proof) => proof.txid === draftRecord.acceptedTxid);
  }
  return proofFixture.transactions?.find((proof) =>
    proof.lane === laneForDraft(draftRecord.draft)
    && proof.entrypoint === draftRecord.draft.entrypoint
  );
}

function laneForDraft(draft) {
  if (draft.contract === "DelayedRecoveryVault") return "vault";
  if (draft.contract === "AssurancePledge") return "assurance";
  return "escrow";
}

function parseSignatureScript(hex) {
  const bytes = hexToBytes(hex);
  const tokens = [];
  for (let index = 0; index < bytes.length;) {
    const opcode = bytes[index++];
    let length = null;
    if (opcode > 0 && opcode <= 75) {
      length = opcode;
    } else if (opcode === OP_PUSHDATA1) {
      length = bytes[index++];
    } else if (opcode === OP_PUSHDATA2) {
      length = bytes[index] + (bytes[index + 1] << 8);
      index += 2;
    }
    if (length !== null) {
      const data = bytes.slice(index, index + length);
      tokens.push({ kind: "push", opcode, dataHex: bytesToHex(data), length });
      index += length;
    } else {
      tokens.push({ kind: "opcode", opcode });
    }
  }
  const redeemScript = tokens[tokens.length - 1];
  const stack = tokens.slice(0, -1);
  const selector = [...stack].reverse().find((token) => token.kind === "opcode");
  return {
    tokens,
    redeemScriptHex: redeemScript?.kind === "push" ? redeemScript.dataHex : "",
    selectorOpcode: selector?.opcode ?? null,
    signaturePushes: stack.filter((token) => token.kind === "push" && token.length >= 64)
  };
}

function inputMassMatchesTxVersion(version, input) {
  if (Number(version) >= 1) {
    return Number(input.computeBudget || 0) > 0 && input.sigOpCount == null;
  }
  return Number(input.sigOpCount || 0) > 0 && input.computeBudget == null;
}

function expectedP2pkScriptFromDraft(draft) {
  return draft.submitPayload.transaction.outputs[0].scriptPublicKey.scriptPublicKey;
}

function ctorArgToHex(arg) {
  if (!arg || !Array.isArray(arg.data)) return null;
  return arg.data.map((item) => Number(item.data).toString(16).padStart(2, "0")).join("");
}

function decimalTkasToSompi(value) {
  const [whole, fraction = ""] = String(value).split(".");
  return `${whole}${fraction.padEnd(8, "0").slice(0, 8)}`;
}

function opcodeName(opcode) {
  if (opcode === OP_0) return "OP_0";
  if (opcode === OP_1) return "OP_1";
  if (opcode === OP_2) return "OP_2";
  return opcode == null ? null : `OP_${opcode.toString(16)}`;
}

function hexToBytes(hex) {
  return Uint8Array.from((hex || "").match(/../g)?.map((chunk) => Number.parseInt(chunk, 16)) || []);
}

function bytesToHex(bytes) {
  return Array.from(bytes || [])
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
