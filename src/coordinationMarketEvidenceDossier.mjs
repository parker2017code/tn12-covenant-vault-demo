export function buildCoordinationMarketEvidenceDossier({
  coordinationPrototype = {},
  settlementBrief = {},
  acceptedOutputs = {},
  custodyImports = {},
  settlementDrafts = {},
  checkpoint = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const selectedPack = settlementBrief.selectedPack || {};
  const qualifyingIds = new Set(selectedPack.solver?.qualifyingIntendoIds || []);
  const intendos = (coordinationPrototype.intendos || [])
    .filter((intendo) => qualifyingIds.has(intendo.intendoId))
    .map((intendo) => buildParticipantRow({
      intendo,
      acceptedOutputs,
      custodyImports,
      checkpoint
    }));
  const releaseOutput = findOutput(acceptedOutputs, settlementDrafts.release?.transactionId);
  const releaseRoute = (settlementBrief.settlementRoutes || [])
    .find((route) => route.kind === "release" && route.status === "route-applicable-needs-wallet-review");
  const allParticipantEvidenceReady = intendos.length > 0
    && intendos.every((row) => row.acceptedPayloadTxid && row.acceptedCustodyOutpoint && row.amountMatches);
  const releaseAccepted = Boolean(settlementDrafts.release?.transactionId && releaseOutput);

  return {
    schema: "tn12-coordination-market-evidence-dossier/v1",
    network: coordinationPrototype.network || settlementBrief.network || "kaspa-testnet-12",
    generatedAt,
    status: allParticipantEvidenceReady && releaseAccepted
      ? "transparent-coordination-evidence-ready"
      : "transparent-coordination-evidence-incomplete",
    sourceArtifacts: [
      "artifacts/coordination-market-prototype.json",
      "artifacts/coordination-market-settlement-brief.json",
      "artifacts/batch-assurance-custody-imports.json",
      "artifacts/batch-assurance-settlement-drafts.json",
      "fixtures/AcceptedOutputEvidence.json",
      "artifacts/checkpointed-accepted-index.json"
    ],
    thesis: "A reviewer can inspect who committed, what condition they accepted, where the TN12 evidence lives, and which release path was selected.",
    summary: {
      selectedPackId: settlementBrief.selectedPackId || selectedPack.packId || "",
      qualifyingIntendos: intendos.length,
      qualifyingTkas: selectedPack.solver?.qualifyingTkas || 0,
      participantEvidenceReady: allParticipantEvidenceReady,
      releaseAccepted,
      releaseTxid: settlementDrafts.release?.transactionId || "",
      releaseOutputTkas: releaseOutput ? sompiToTkas(releaseOutput.amountSompi) : "",
      acceptedCheckpointRows: Number(checkpoint.summary?.total || 0),
      mainnetClaims: 0,
      productionCustodyClaims: 0,
      opaqueExecutionClaims: 0
    },
    reviewerPath: [
      "Read the selected Stag and Pack.",
      "Inspect each qualifying Intendo and its threshold condition.",
      "Open the accepted payload receipt for each pledge.",
      "Compare the custody outpoint and amount against accepted output evidence.",
      "Open the selected release txid.",
      "Confirm refund alternates are non-selected for the spent pledge outputs."
    ],
    participants: intendos,
    selectedRelease: {
      routeId: releaseRoute?.routeId || "",
      status: releaseAccepted ? "accepted-on-tn12" : "needs-accepted-release-evidence",
      txid: settlementDrafts.release?.transactionId || "",
      outputTkas: releaseOutput ? sompiToTkas(releaseOutput.amountSompi) : "",
      destination: releaseOutput?.destination || "",
      explorerUrl: releaseOutput?.txid ? `https://tn12.kaspa.stream/transactions/${releaseOutput.txid}` : "",
      draftPath: settlementDrafts.release?.path || "",
      inputCount: settlementDrafts.release?.inputCount || 0
    },
    alternateRoutes: (settlementDrafts.refunds || []).map((refund) => ({
      kind: "refund",
      pledgeId: refund.pledgeId,
      status: refund.status,
      draftPath: refund.path,
      transactionId: refund.transactionId,
      reason: "Non-selected after accepted release for the same pledge set."
    })),
    boundaries: [
      "This proves a transparent coordination slice, not private Staghunt/Hashdag infrastructure.",
      "Each participant has one visible capital source; capital multiplexing is still missing.",
      "Release was accepted through local testnet signing; user-wallet signing remains a separate rail.",
      "Atomic Hunt execution across independent private commitments is still missing."
    ],
    nextUpgrade: "Turn the selected release route into a user-wallet request, run it with fresh TN12 participant wallets, then replay the accepted txid before promoting a public playground flow."
  };
}

function buildParticipantRow({
  intendo = {},
  acceptedOutputs = {},
  custodyImports = {},
  checkpoint = {}
} = {}) {
  const pledgeId = intendo.capitalReference;
  const custody = (custodyImports.imports || []).find((row) => row.pledgeId === pledgeId) || {};
  const acceptedOutput = (acceptedOutputs.outputs || []).find((row) => row.subject === pledgeId) || {};
  const checkpointPayload = findCheckpointPayload(checkpoint, pledgeId);
  const amountTkas = Number(intendo.amountTkas || 0);
  const custodyTkas = Number(custody.amount?.pastedTkas || sompiToTkas(acceptedOutput.amountSompi) || 0);

  return {
    intendoId: intendo.intendoId,
    participant: intendo.user,
    committedAction: intendo.committedAction,
    thresholdCondition: intendo.thresholdCondition,
    amountTkas,
    pledgeId,
    signatureStatus: intendo.signatureStatus,
    acceptedPayloadTxid: checkpointPayload?.txid || "",
    acceptedPayloadEvidencePath: checkpointPayload?.evidencePath || "",
    acceptedCustodyOutpoint: acceptedOutput.txid
      ? `${acceptedOutput.txid}:${acceptedOutput.outputIndex}`
      : "",
    acceptedCustodyDestination: acceptedOutput.destination || "",
    acceptedCustodyBlueScore: acceptedOutput.acceptingBlockBlueScore || null,
    custodyImportStatus: custody.status || "",
    amountMatches: Number.isFinite(custodyTkas) && custodyTkas === amountTkas,
    evidenceStatus: checkpointPayload?.txid && acceptedOutput.txid && custody.status === "custody-import-ready"
      ? "accepted-payload-and-custody"
      : "evidence-incomplete"
  };
}

function findCheckpointPayload(checkpoint, pledgeId) {
  const subject = `kaspa-dev-docs-sprint:${pledgeId}`;
  return (checkpoint.records || []).find((record) =>
    record.payload?.subject === subject
    || record.payload?.decoded?.payload?.subject === subject
    || record.subject === subject
    || record.invoiceId === subject
  ) || {};
}

function findOutput(acceptedOutputs, txid) {
  return (acceptedOutputs.outputs || []).find((row) => row.txid === txid) || null;
}

function sompiToTkas(value) {
  if (value === undefined || value === null || value === "") return "";
  const sompi = BigInt(String(value));
  const whole = sompi / 100000000n;
  const fraction = sompi % 100000000n;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
