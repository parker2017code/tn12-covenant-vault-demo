export function buildPredictionHedgeSimulator({ fixture = {}, attestationRegistry = {}, attestationThresholds = {} } = {}) {
  const signals = attestationRegistry.signals || [];
  const thresholdsBySignalId = new Map((attestationThresholds.signals || []).map((signal) => [signal.id, signal]));
  const markets = (fixture.markets || []).map((market) => buildMarket(market, signals, thresholdsBySignalId));
  const positions = fixture.positions || [];
  const suggestions = positions.map((position) => buildSuggestion(position, markets));
  const reviewSuggestions = suggestions.filter((suggestion) => suggestion.status === "review-suggested").length;

  return {
    schema: "tn12-prediction-hedge-simulator/v1",
    reviewedAt: fixture.reviewedAt || "2026-05-08",
    status: "simulation-only",
    summary: {
      markets: markets.length,
      positions: positions.length,
      verifiedSignalInputs: markets.reduce((total, market) => total + market.verifiedSignalInputs, 0),
      thresholdAllowedSignalInputs: markets.reduce((total, market) => total + market.thresholdAllowedSignalInputs, 0),
      thresholdBlockedSignalInputs: markets.reduce((total, market) => total + market.thresholdBlockedSignalInputs, 0),
      reviewSuggestions
    },
    markets,
    positions: positions.map(normalizePosition),
    suggestions,
    rules: fixture.rules || [],
    boundaries: [
      "This simulator does not custody funds, execute trades, create odds, or settle markets.",
      "Signals affect a probability only when they are verified, anchored by accepted payload evidence, and allowed by the attestation threshold artifact.",
      "Suggestions are review prompts for a user-owned plan, not financial advice or automatic execution."
    ]
  };
}

function buildMarket(market, signals, thresholdsBySignalId) {
  const relatedSignals = signals.filter((signal) => signal.eventId === market.eventId);
  const verifiedPayloadSignals = relatedSignals.filter((signal) => (
    signal.status === "verified"
    && signal.acceptedTxid
    && signal.evidencePath
    && signal.signatureReview?.status === "verified"
  ));
  const thresholdAllowedSignals = verifiedPayloadSignals.filter((signal) => thresholdsBySignalId.get(signal.id)?.influenceAllowed === true);
  const signalAdjustment = thresholdAllowedSignals.reduce((total, signal) => {
    const accuracy = signal.resolution?.accuracy ?? signal.confidence;
    return total + Math.round(((signal.confidence - 50) * 0.35) + ((accuracy - 50) * 0.2));
  }, 0);
  const probability = clampPercent(Number(market.baseProbability || 0) + signalAdjustment);

  return {
    id: String(market.id || ""),
    eventId: String(market.eventId || ""),
    name: String(market.name || ""),
    exposureTag: String(market.exposureTag || ""),
    userQuestion: String(market.userQuestion || ""),
    resolutionSource: String(market.resolutionSource || ""),
    baseProbability: clampPercent(market.baseProbability),
    simulatedProbability: probability,
    verifiedSignalInputs: verifiedPayloadSignals.length,
    thresholdAllowedSignalInputs: thresholdAllowedSignals.length,
    thresholdBlockedSignalInputs: verifiedPayloadSignals.length - thresholdAllowedSignals.length,
    ignoredSignals: relatedSignals.length - verifiedPayloadSignals.length,
    signalIds: thresholdAllowedSignals.map((signal) => signal.id),
    acceptedEvent: market.acceptedEvent || null,
    status: thresholdAllowedSignals.length > 0
      ? "signal-adjusted"
      : verifiedPayloadSignals.length > 0
      ? "threshold-blocked"
      : "baseline-only"
  };
}

function buildSuggestion(position, markets) {
  const normalized = normalizePosition(position);
  const market = markets.find((item) => item.exposureTag === normalized.exposureTag);
  if (!market) {
    return {
      positionId: normalized.id,
      status: "no-market",
      action: "No matching event market in this simulator.",
      riskScore: 0
    };
  }

  const riskScore = clampPercent(Math.round((market.simulatedProbability * normalized.sensitivity) / 100));
  const status = market.thresholdAllowedSignalInputs > 0 && market.simulatedProbability >= normalized.reviewThreshold
    ? "review-suggested"
    : "watch";

  return {
    positionId: normalized.id,
    marketId: market.id,
    status,
    riskScore,
    acceptedReview: normalized.acceptedReview,
    action: status === "review-suggested"
      ? "Review exposure and require explicit wallet review before any action."
      : "Watch only; no action suggested.",
    reason: `${market.simulatedProbability}% simulated probability, ${normalized.reviewThreshold}% review threshold.`
  };
}

function normalizePosition(position) {
  return {
    id: String(position.id || ""),
    label: String(position.label || ""),
    exposureTag: String(position.exposureTag || ""),
    notionalTkas: Number(position.notionalTkas || 0),
    sensitivity: clampPercent(position.sensitivity),
    reviewThreshold: clampPercent(position.reviewThreshold),
    acceptedReview: position.acceptedReview || null
  };
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
