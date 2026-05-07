export function buildAttestationRegistry(fixture) {
  const signals = (fixture.signals || []).map(normalizeSignal);
  const sources = buildSourceSummaries(signals);
  const summary = {
    total: signals.length,
    verified: signals.filter((signal) => signal.status === "verified").length,
    disputed: signals.filter((signal) => signal.status === "disputed").length,
    channels: [...new Set(signals.map((signal) => signal.channel))],
    nextSettlement: fixture.nextSettlement || "Anchor signed attestations as transaction payload receipts before any payout or market settlement."
  };

  return {
    schema: "tn12-attestation-registry/v1",
    network: "kaspa-testnet-12",
    status: "research-fixture-not-market-settlement",
    summary,
    sources,
    signals,
    incentiveRules: fixture.incentiveRules || [],
    boundaries: [
      "Current build uses signed/off-chain attestations plus transaction payload receipts; it does not require arbitrary app data in block headers.",
      "Coinbase payload and pool policy are later miner/pool integration surfaces.",
      "Prediction-market and portfolio-hedge flows stay simulated until legal, oracle, wallet, liquidity, and settlement assumptions are explicit."
    ]
  };
}

export function normalizeSignal(signal) {
  const confidence = clampPercent(signal.confidence);
  const resolvedAccuracy = signal.resolution?.accuracy === undefined
    ? null
    : clampPercent(signal.resolution.accuracy);

  return {
    id: String(signal.id || ""),
    eventId: String(signal.eventId || ""),
    channel: String(signal.channel || "signed-attestation"),
    source: String(signal.source || "unknown-source"),
    sourceType: String(signal.sourceType || "watcher"),
    acceptedTxid: String(signal.acceptedTxid || ""),
    evidencePath: String(signal.evidencePath || ""),
    claim: String(signal.claim || ""),
    observedAt: String(signal.observedAt || ""),
    submittedAt: String(signal.submittedAt || ""),
    confidence,
    evidence: signal.evidence || {},
    status: String(signal.status || "draft"),
    marketUse: String(signal.marketUse || "research-only"),
    portfolioUse: String(signal.portfolioUse || "alert-only"),
    rewardHint: String(signal.rewardHint || "Reward only after usefulness and accuracy are measured."),
    resolution: signal.resolution
      ? {
          status: String(signal.resolution.status || "unresolved"),
          accuracy: resolvedAccuracy,
          note: String(signal.resolution.note || "")
        }
      : { status: "unresolved", accuracy: null, note: "No resolution yet." }
  };
}

function buildSourceSummaries(signals) {
  const sourceMap = new Map();

  for (const signal of signals) {
    const current = sourceMap.get(signal.source) || {
      source: signal.source,
      sourceType: signal.sourceType,
      submitted: 0,
      verified: 0,
      disputed: 0,
      averageConfidence: 0,
      averageAccuracy: null,
      reputationScore: 0
    };

    current.submitted += 1;
    if (signal.status === "verified") current.verified += 1;
    if (signal.status === "disputed") current.disputed += 1;
    current.averageConfidence += signal.confidence;
    if (signal.resolution.accuracy !== null) {
      current.accuracyTotal = (current.accuracyTotal || 0) + signal.resolution.accuracy;
      current.accuracyCount = (current.accuracyCount || 0) + 1;
    }
    sourceMap.set(signal.source, current);
  }

  return [...sourceMap.values()].map((source) => {
    const averageConfidence = Math.round(source.averageConfidence / source.submitted);
    const averageAccuracy = source.accuracyCount
      ? Math.round(source.accuracyTotal / source.accuracyCount)
      : null;
    const reputationScore = clampPercent(
      (source.verified / source.submitted) * 55 +
      (averageAccuracy ?? averageConfidence) * 0.35 -
      source.disputed * 15
    );

    return {
      source: source.source,
      sourceType: source.sourceType,
      submitted: source.submitted,
      verified: source.verified,
      disputed: source.disputed,
      averageConfidence,
      averageAccuracy,
      reputationScore
    };
  }).sort((a, b) => b.reputationScore - a.reputationScore);
}

function clampPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
