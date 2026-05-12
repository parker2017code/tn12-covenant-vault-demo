export function buildRecurringTreasuryVaultNegatives({ status }) {
  const baseTxid = status.currentEvidence?.acceptedWalletPolicyTxid || "";
  const rows = [
    {
      id: "wrong-owner-signature",
      mutation: "replace ownerSig with a non-owner signature",
      expectedFailure: "checkSig(ownerSig, owner)",
      status: "blocked-candidate"
    },
    {
      id: "wrong-destination",
      mutation: "change output 0 scriptPublicKey away from destination",
      expectedFailure: "destination output must equal new ScriptPubKeyP2PK(destination)",
      status: "blocked-candidate"
    },
    {
      id: "over-cap",
      mutation: "set amount so prevState.spent + amount exceeds cap",
      expectedFailure: "prevState.spent + amount <= cap",
      status: "blocked-candidate"
    },
    {
      id: "missing-continuation",
      mutation: "remove output 1 or make it a non-continuation output",
      expectedFailure: "validateOutputState(1, newState)",
      status: "blocked-candidate"
    },
    {
      id: "bad-window-state",
      mutation: "emit a continuation state where spent/window do not match the spend",
      expectedFailure: "newState.spent increments by amount and window stays constant",
      status: "blocked-candidate"
    }
  ];

  return {
    schema: "tn12-recurring-treasury-vault-negative-map/v1",
    reviewedAt: "2026-05-12",
    contract: status.contract,
    status: rows.every((row) => row.status === "blocked-candidate")
      ? "negative-candidate-map-ready"
      : "negative-candidate-map-needs-review",
    sourceEvidence: {
      walletPolicyTxid: baseTxid,
      compiledArtifact: status.compiledArtifact
    },
    rows,
    summary: {
      candidates: rows.length,
      blockedCandidates: rows.filter((row) => row.status === "blocked-candidate").length,
      submittedRejections: 0
    },
    nextStep: "Build signed invalid drafts only from fresh expendable contract outputs; do not submit invalid candidates against the only good proof output."
  };
}
