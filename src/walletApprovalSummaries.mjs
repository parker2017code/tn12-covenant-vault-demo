export function buildWalletApprovalSummaries({
  resetProof = {},
  resetDraft = {},
  continuation = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const accepted = resetProof.accepted || {};
  const state = resetDraft.state || resetProof.state?.reset || {};
  const source = resetDraft.source || {};
  const outputs = resetDraft.submitPayload?.transaction?.outputs || [];
  const destinationOutput = outputs[0] || {};
  const continuationOutput = outputs[1] || {};
  const acceptedReset = resetProof.status === "accepted-window-reset-with-local-negatives"
    && resetDraft.status === "signed-local-engine-passed-not-broadcast"
    && resetDraft.transactionId === accepted.resetTxid;
  const localRejects = Array.isArray(resetProof.negativeCases) ? resetProof.negativeCases : [];

  return {
    schema: "tn12-wallet-approval-summaries/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: acceptedReset && localRejects.length >= 3
      ? "wallet-approval-summary-ready"
      : "wallet-approval-summary-review",
    purpose: "Translate covenant evidence into fields a wallet could show before Approve/Reject.",
    summaries: [
      {
        id: "recurring-cap-reset-window",
        experiment: "recurring-cap-proof",
        evidenceClass: "TN12_ACCEPTED_SCRIPT_ENFORCED",
        recommendedWalletDecision: "approve-if-user-initiated",
        title: "Reset recurring treasury window",
        plainAction: `Spend ${sompiToTkas(state.spendAmountSompi)} tKAS from the capped treasury and relock ${sompiToTkas(continuationOutput.amount)} tKAS as the next covenant state.`,
        userChecks: [
          `Amount: ${sompiToTkas(state.spendAmountSompi)} tKAS`,
          `Cap: ${sompiToTkas(state.capSompi)} tKAS`,
          `Previously spent in window: ${sompiToTkas(state.prevSpentSompi)} tKAS`,
          `Next spent in window: ${sompiToTkas(state.nextSpentSompi)} tKAS`,
          `New window start: ${state.nextWindow}`,
          "Continuation output is relocked to the same covenant id"
        ],
        technicalChecks: {
          contract: source.contract || resetProof.contract || "",
          sourceOutpoint: `${source.contractOutpoint?.txid || ""}:${source.contractOutpoint?.outputIndex ?? ""}`,
          spendTxid: accepted.resetTxid || resetDraft.transactionId || "",
          explorerUrl: accepted.resetTxid ? `https://tn12.kaspa.stream/transactions/${accepted.resetTxid}` : "",
          covenantId: source.covenantId || continuation.covenantId || "",
          lockTime: String(state.lockTime ?? ""),
          resetWindow: String(state.resetWindow ?? ""),
          destination: {
            amountTkas: sompiToTkas(destinationOutput.amount),
            scriptPublicKey: destinationOutput.scriptPublicKey?.scriptPublicKey || ""
          },
          continuation: {
            outpoint: accepted.continuationOutpoint || `${continuation.txid || ""}:${continuation.outputIndex ?? ""}`,
            amountTkas: sompiToTkas(continuationOutput.amount || continuation.amountSompi),
            covenantId: continuationOutput.covenant?.covenantId || continuation.covenantId || "",
            scriptPublicKey: continuationOutput.scriptPublicKey?.scriptPublicKey || continuation.scriptPublicKey || ""
          }
        },
        refusalPrompts: localRejects.map((item) => ({
          id: item.id,
          recommendedWalletDecision: "reject",
          evidenceClass: "LOCAL_SCRIPT_ENGINE_REJECT",
          reason: item.reason,
          artifact: item.artifact,
          candidateTxid: item.transactionId || ""
        })),
        boundaries: [
          "This is a wallet-readable summary for a TN12/testnet covenant path.",
          "It does not prove wallet-standard signing or mainnet readiness.",
          "Local reject rows are script-engine evidence, not broadcast-rejected TN12 invalid transactions."
        ]
      }
    ]
  };
}

function sompiToTkas(value) {
  if (value === undefined || value === null || value === "") return "";
  const sompi = BigInt(value);
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
