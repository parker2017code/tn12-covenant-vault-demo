export function buildCoordinationCovenantSettlementTarget({
  dossier = {},
  acceptedOutputs = {},
  settlementDrafts = {},
  covenantReleaseEvidence = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const pledgeOutputs = (acceptedOutputs.outputs || [])
    .filter((row) => row.lane === "batch-assurance-pledge-output");
  const releaseOutput = (acceptedOutputs.outputs || [])
    .find((row) => row.lane === "batch-assurance-settlement-output") || {};
  const covenantPledgeOutputs = pledgeOutputs.filter((row) => /covenant/i.test(row.scriptType || ""));
  const pubkeyPledgeOutputs = pledgeOutputs.filter((row) => row.scriptType === "pubkey");
  const selectedRelease = dossier.selectedRelease || {};
  const currentReleaseAccepted = selectedRelease.status === "accepted-on-tn12"
    || settlementDrafts.status === "release-accepted-tn12";
  const acceptedCovenantReleases = Number(covenantReleaseEvidence.summary?.acceptedReleases || 0);
  const covenantReleaseAccepted = covenantReleaseEvidence.status === "accepted-covenant-release-spends"
    && acceptedCovenantReleases > 0;
  const freshCovenantOutputsRequired = pubkeyPledgeOutputs.length > 0
    && covenantPledgeOutputs.length === 0
    && !covenantReleaseAccepted;

  return {
    schema: "tn12-coordination-covenant-settlement-target/v1",
    network: dossier.network || acceptedOutputs.network || "kaspa-testnet-12",
    generatedAt,
    status: covenantReleaseAccepted
      ? "accepted-covenant-release-spends"
      : freshCovenantOutputsRequired
        ? "fresh-covenant-pledge-outputs-required"
        : "covenant-pledge-target-review",
    experiment: "coordination-release-evidence",
    purpose: "Turn the transparent coordination release into a covenant-settlement target without upgrading the existing P2PK release claim.",
    currentEvidence: {
      selectedPackId: dossier.summary?.selectedPackId || "",
      qualifyingIntendos: Number(dossier.summary?.qualifyingIntendos || 0),
      qualifyingTkas: Number(dossier.summary?.qualifyingTkas || 0),
      releaseAccepted: currentReleaseAccepted,
      releaseTxid: selectedRelease.txid || settlementDrafts.release?.transactionId || "",
      releaseExplorerUrl: selectedRelease.explorerUrl || "",
      releaseScriptType: releaseOutput.scriptType || "",
      pledgeOutputScriptTypes: unique(pledgeOutputs.map((row) => row.scriptType || "")),
      pledgeOutputsSpentByRelease: currentReleaseAccepted,
      freshCovenantFundingTxid: covenantReleaseEvidence.funding?.txid || "",
      acceptedCovenantReleaseSpends: acceptedCovenantReleases
    },
    targetV1: {
      contractPattern: "per-pledge AssurancePledge covenant outputs plus selected release route",
      contractSource: "contracts/AssurancePledge.sil",
      route: "fund fresh covenant pledge outputs, then release each qualifying pledge to the selected recipient or refund after deadline",
      requiredFreshOutputs: pledgeOutputs.map((row) => ({
        pledgeId: row.subject,
        amountSompi: row.amountSompi,
        amountTkas: sompiToTkas(row.amountSompi),
        priorScriptType: row.scriptType,
        targetScriptType: "covenant",
        contributorDestination: row.destination
      })),
      selectedRecipient: settlementDrafts.campaign?.recipientAddress || selectedRelease.destination || "",
      deadlineIso: settlementDrafts.campaign?.deadlineIso || "",
      minimumPledgeTkas: settlementDrafts.campaign?.minimumPledgeTkas || null
    },
    localChecksNeeded: [
      "compile AssurancePledge with each contributor and selected recipient",
      "prove release path pays the selected recipient",
      "prove refund path requires contributor signature and deadline",
      "prove release/refund are mutually exclusive for each fresh covenant pledge output",
      "prove the coordination reducer only selects release after the threshold pack qualifies"
    ],
    nextTn12Run: [
      "create fresh throwaway participant wallets or reuse safe testnet keys",
      "fund three covenant-bound pledge outputs instead of P2PK pledge outputs",
      "submit release spends after the pack qualifies",
      "record refund drafts as non-selected alternates for those same fresh outputs",
      "replay accepted txids before upgrading the experiment status"
    ],
    blockers: covenantReleaseAccepted
      ? [
          "threshold selection remains replay/planner evidence",
          "refund-path evidence needs fresh unspent covenant pledge outputs"
        ]
      : freshCovenantOutputsRequired
      ? [
          "current accepted pledge outputs are P2PK, not covenant-bound",
          "current accepted pledge outputs have already selected the release branch",
          "a new TN12 pledge set is required for covenant-settlement evidence"
        ]
      : [],
    boundaries: covenantReleaseAccepted
      ? [
          "Fresh AssurancePledge covenant outputs and release spends are accepted on TN12.",
          "Threshold selection remains transparent replay/planner evidence.",
          "Refund-path evidence still needs fresh unspent covenant pledge outputs."
        ]
      : [
          "This is a target artifact, not accepted covenant-settlement evidence.",
          "The existing coordination release remains useful accepted TN12 evidence, but it is not a covenant-bound pledge settlement.",
          "Do not call Coordination covenant-settled until fresh covenant pledge outputs and accepted covenant release/refund evidence exist."
        ]
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sompiToTkas(value) {
  if (value === undefined || value === null || value === "") return "";
  const sompi = BigInt(String(value));
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
