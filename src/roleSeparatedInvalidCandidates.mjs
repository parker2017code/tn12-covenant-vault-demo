const ENTRYPOINTS = {
  recover: {
    role: "vaultRecovery",
    wrongSigner: "vaultOwner",
    outputRole: "vaultRecovery",
    wrongOutputRole: "vaultOwner",
    selector: "OP_1",
    wrongSelector: "OP_0",
    timeLocked: false
  },
  withdraw: {
    role: "vaultOwner",
    wrongSigner: "vaultRecovery",
    outputRole: "vaultOwner",
    wrongOutputRole: "vaultRecovery",
    selector: "OP_0",
    wrongSelector: "OP_1",
    timeLocked: true
  },
  releaseAssurance: {
    role: "pledgeRecipient",
    wrongSigner: "pledgeContributor",
    outputRole: "pledgeRecipient",
    wrongOutputRole: "pledgeContributor",
    selector: "OP_0",
    wrongSelector: "OP_1",
    timeLocked: false
  },
  refundAssurance: {
    role: "pledgeContributor",
    wrongSigner: "pledgeRecipient",
    outputRole: "pledgeContributor",
    wrongOutputRole: "pledgeRecipient",
    selector: "OP_1",
    wrongSelector: "OP_0",
    timeLocked: true
  },
  releaseEscrow: {
    role: "escrowBuyer",
    wrongSigner: "escrowSeller",
    outputRole: "escrowSeller",
    wrongOutputRole: "escrowBuyer",
    selector: "OP_0",
    wrongSelector: "OP_1",
    timeLocked: false
  },
  refundEscrow: {
    role: "escrowBuyer",
    wrongSigner: "escrowSeller",
    outputRole: "escrowBuyer",
    wrongOutputRole: "escrowSeller",
    selector: "OP_1",
    wrongSelector: "OP_0",
    timeLocked: true
  },
  cancelEscrow: {
    role: "escrowBuyer+escrowSeller",
    wrongSigner: "escrowBuyer only",
    outputRole: "escrowBuyer",
    wrongOutputRole: "escrowSeller",
    selector: "OP_2",
    wrongSelector: "OP_0",
    timeLocked: false,
    requiresTwoSignatures: true
  }
};

const DRAFTS = {
  "Role-separated vault recovery": {
    path: "artifacts/signed-drafts/role-vault-recovery.json",
    spec: "recover"
  },
  "Role-separated DAA vault withdrawal": {
    path: "artifacts/signed-drafts/role-daa-expired-vault-withdrawal.json",
    spec: "withdraw"
  },
  "Role-separated assurance release": {
    path: "artifacts/signed-drafts/role-assurance-release.json",
    spec: "releaseAssurance"
  },
  "Role-separated DAA assurance refund": {
    path: "artifacts/signed-drafts/role-daa-expired-assurance-refund.json",
    spec: "refundAssurance"
  },
  "Role-separated escrow release": {
    path: "artifacts/signed-drafts/role-escrow-release.json",
    spec: "releaseEscrow"
  },
  "Role-separated DAA escrow refund": {
    path: "artifacts/signed-drafts/role-daa-expired-escrow-refund.json",
    spec: "refundEscrow"
  },
  "Role-separated escrow cancel": {
    path: "artifacts/signed-drafts/role-expired-escrow-cancel.json",
    spec: "cancelEscrow"
  }
};

export function buildRoleSeparatedInvalidCandidates({
  proofFixture = {},
  drafts = {},
  roleWallets = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const cases = (proofFixture.transactions || []).map((proof) => {
    const draftRecord = DRAFTS[proof.label];
    const draft = drafts[draftRecord?.path] || {};
    const spec = ENTRYPOINTS[draftRecord?.spec] || {};
    const base = {
      label: proof.label,
      txid: proof.txid,
      source: proof.source,
      destination: proof.destination,
      draftPath: draftRecord?.path || null,
      draftTransactionId: draft.transactionId || null,
      entrypoint: proof.entrypoint,
      lane: proof.lane,
      contract: draft.contract || null,
      selector: spec.selector || null,
      role: spec.role || null,
      outputRole: spec.outputRole || null,
      currentOutput: outputShape(draft),
      expectedRoleAddress: roleAddress(roleWallets, spec.outputRole),
      wrongRoleAddress: roleAddress(roleWallets, spec.wrongOutputRole)
    };

    return {
      ...base,
      candidates: buildCandidates({ proof, draft, spec, roleWallets })
    };
  });
  const candidates = cases.flatMap((item) => item.candidates);

  return {
    schema: "tn12-role-separated-invalid-candidates/v1",
    network: proofFixture.network || "kaspa-testnet-12",
    generatedAt,
    status: "local-review-only-not-submitted",
    summary: {
      proofPaths: cases.length,
      candidates: candidates.length,
      wrongSigner: countCandidate(candidates, "wrong-signer"),
      wrongSelector: countCandidate(candidates, "wrong-selector"),
      wrongOutputLock: countCandidate(candidates, "wrong-output-lock"),
      wrongOutputAmount: countCandidate(candidates, "wrong-output-amount"),
      badLockShape: countCandidate(candidates, "bad-lock-shape"),
      singlePartyCancel: countCandidate(candidates, "single-party-cancel"),
      readyForSubmission: 0
    },
    scope: [
      "These are exact invalid-candidate definitions for local review.",
      "They are not signed invalid transactions and must not be submitted until a fresh expendable output is funded for that specific rejection test.",
      "Each candidate names the field to mutate, the expected protocol failure, and the accepted proof it is derived from."
    ],
    cases
  };
}

function buildCandidates({ proof, draft, spec, roleWallets }) {
  const outputAmount = BigInt(proof.amountSompi || "0");
  const wrongRole = roleWallets.roles?.[spec.wrongOutputRole] || {};
  const currentLockShape = lockShape(draft);
  const candidates = [
    {
      id: "wrong-signer",
      mutate: "signatureScript",
      from: spec.role,
      to: spec.wrongSigner,
      exactField: "submitPayload.transaction.inputs[0].signatureScript",
      expectedFailure: "checkSig should fail for the role public key encoded in the constructor."
    },
    {
      id: "wrong-selector",
      mutate: "entrypoint selector",
      from: spec.selector,
      to: spec.wrongSelector,
      exactField: "submitPayload.transaction.inputs[0].signatureScript selector opcode",
      expectedFailure: "The witness should dispatch to a branch with different signature, time, or output rules."
    },
    {
      id: "wrong-output-lock",
      mutate: "transaction.outputs[0].scriptPublicKey",
      from: spec.outputRole,
      to: spec.wrongOutputRole,
      exactField: "submitPayload.transaction.outputs[0].scriptPublicKey",
      wrongAddress: wrongRole.address || null,
      wrongXOnlyPublicKey: wrongRole.xOnlyPublicKey || null,
      expectedFailure: "The covenant should reject because output 0 pays the wrong role."
    },
    {
      id: "wrong-output-amount",
      mutate: "transaction.outputs[0].amount",
      from: proof.amountSompi,
      to: String(outputAmount > 0n ? outputAmount - 1n : 0n),
      exactField: "submitPayload.transaction.outputs[0].amount",
      expectedFailure: "The covenant should reject because output 0 does not equal input value minus minerFee."
    }
  ];

  if (spec.timeLocked) {
    candidates.push({
      id: "bad-lock-shape",
      mutate: "transaction.lockTime / input.sequence",
      from: currentLockShape,
      to: { lockTime: 0, sequence: "18446744073709551615" },
      exactField: "submitPayload.transaction.lockTime and inputs[0].sequence",
      expectedFailure: "The node or script should reject the timed branch before the required lock condition is met."
    });
  }

  if (spec.requiresTwoSignatures) {
    candidates.push({
      id: "single-party-cancel",
      mutate: "signatureScript",
      from: "buyerSig + sellerSig",
      to: "buyerSig only",
      exactField: "submitPayload.transaction.inputs[0].signatureScript",
      expectedFailure: "The cancel branch should reject without both buyer and seller signatures."
    });
  }

  return candidates;
}

function lockShape(draft) {
  return {
    lockTime: Number(draft.submitPayload?.transaction?.lockTime || 0),
    sequence: draft.submitPayload?.transaction?.inputs?.[0]?.sequence || null
  };
}

function outputShape(draft) {
  const output = draft.submitPayload?.transaction?.outputs?.[0] || {};
  return {
    amount: output.amount ?? null,
    scriptPublicKey: output.scriptPublicKey || null,
    destination: draft.destination?.address || null
  };
}

function roleAddress(roleWallets, role) {
  return roleWallets.roles?.[role]?.address || null;
}

function countCandidate(candidates, id) {
  return candidates.filter((candidate) => candidate.id === id).length;
}
