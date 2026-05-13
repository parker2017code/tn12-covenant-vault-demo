export function buildSiblingInputDiscovery({
  strikeEvidence = {},
  strikeDraft = {},
  negativeEvidence = {},
  ownerOutpoint = {},
  assetOutpoint = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const acceptedFlow = Array.isArray(strikeEvidence.acceptedFlow) ? strikeEvidence.acceptedFlow : [];
  const ownerMarker = acceptedFlow.find((item) => item.step === "owner-marker-genesis") || negativeEvidence.acceptedPositivePath?.ownerMarker || {};
  const assetGenesis = acceptedFlow.find((item) => item.step === "asset-duel-genesis") || negativeEvidence.acceptedPositivePath?.assetGenesis || {};
  const strike = acceptedFlow.find((item) => item.step === "sibling-authorized-strike") || negativeEvidence.acceptedPositivePath?.siblingAuthorizedStrike || {};
  const requiredCovenantId = strike.state?.ownerCovenantId || assetGenesis.ownerCovenantId || strikeDraft.source?.ownerMarkerOutpoint?.covenantId || "";
  const expectedWitnessInput = Number(strike.state?.witnessInput ?? strikeDraft.state?.witnessInput ?? 1);
  const candidate = {
    txid: ownerOutpoint.txid || ownerMarker.txid || strikeDraft.source?.ownerMarkerOutpoint?.txid || "",
    outputIndex: Number(ownerOutpoint.outputIndex ?? ownerMarker.outputIndex ?? strikeDraft.source?.ownerMarkerOutpoint?.outputIndex ?? 0),
    covenantId: ownerOutpoint.covenantId || ownerMarker.covenantId || strikeDraft.source?.ownerMarkerOutpoint?.covenantId || "",
    amountSompi: ownerOutpoint.amountSompi || ownerMarker.amountSompi || strikeDraft.source?.ownerMarkerOutpoint?.amountSompi || "",
    status: ownerOutpoint.status || ownerMarker.status || ""
  };
  const candidateMatches = Boolean(candidate.txid)
    && candidate.covenantId === requiredCovenantId
    && candidate.status === "accepted";
  const localCases = Array.isArray(negativeEvidence.cases) ? negativeEvidence.cases : [];
  const requiredRejects = [
    "wrong_witness_rejects_asset_move",
    "missing_sibling_rejects_asset_move",
    "wrong_sibling_covenant_rejects_asset_move"
  ];
  const rejectCoverage = requiredRejects.map((name) => {
    const row = localCases.find((item) => item.name === name) || {};
    return {
      name,
      status: row.status || "missing",
      expected: row.expected ?? false,
      got: row.got ?? null
    };
  });
  const rejectsCovered = rejectCoverage.every((item) => item.status === "passed" && item.got === false && item.expected === false);

  return {
    schema: "tn12-sibling-input-discovery/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: candidateMatches && rejectsCovered
      ? "sibling-input-discovery-ready"
      : "sibling-input-discovery-review",
    experiment: "sibling-authorized-asset-proof",
    purpose: "Show how a wallet or builder discovers the required sibling input for the ICC asset move.",
    requiredSibling: {
      covenantId: requiredCovenantId,
      witnessInput: expectedWitnessInput,
      role: "owner-marker-authority",
      reason: "The asset covenant accepts the configured owner covenant id at the witnessed sibling input instead of nesting owner-contract execution."
    },
    selectedCandidate: {
      ...candidate,
      outpoint: candidate.txid ? `${candidate.txid}:${candidate.outputIndex}` : "",
      explorerUrl: candidate.txid ? `https://tn12.kaspa.stream/transactions/${candidate.txid}` : ""
    },
    assetInput: {
      txid: assetOutpoint.txid || assetGenesis.txid || strikeDraft.source?.assetOutpoint?.txid || "",
      outputIndex: Number(assetOutpoint.outputIndex ?? assetGenesis.outputIndex ?? strikeDraft.source?.assetOutpoint?.outputIndex ?? 0),
      covenantId: assetOutpoint.covenantId || assetGenesis.covenantId || strikeDraft.source?.assetOutpoint?.covenantId || "",
      status: assetOutpoint.status || assetGenesis.status || ""
    },
    acceptedStrike: {
      txid: strike.txid || strikeDraft.transactionId || "",
      explorerUrl: strike.explorerUrl || (strike.txid ? `https://tn12.kaspa.stream/transactions/${strike.txid}` : ""),
      powerBefore: Number(strike.state?.powerBefore ?? strikeDraft.state?.powerBefore ?? 0),
      powerAfter: Number(strike.state?.powerAfter ?? strikeDraft.state?.powerAfter ?? 0)
    },
    discoverySteps: [
      "Read the asset state or compiled artifact to get the required owner covenant id.",
      "Find an accepted, unspent sibling candidate with that covenant id.",
      `Place that sibling at transaction input ${expectedWitnessInput}.`,
      "Reject the transaction if the sibling is missing, at the wrong witness index, or from another covenant id."
    ],
    localRejectCoverage: rejectCoverage,
    boundaries: [
      "This is deterministic discovery over accepted TN12 fixture data and local negative checks.",
      "It does not prove a production indexer, wallet UX, or mainnet asset standard.",
      "The accepted strike proves the sibling path once; future asset moves need fresh live sibling and asset state discovery."
    ]
  };
}
