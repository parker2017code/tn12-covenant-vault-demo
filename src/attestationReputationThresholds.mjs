export function buildAttestationReputationThresholds({
  attestationRegistry = {}
} = {}) {
  const sources = Array.isArray(attestationRegistry.sources) ? attestationRegistry.sources : [];
  const signals = Array.isArray(attestationRegistry.signals) ? attestationRegistry.signals : [];
  const sourceThresholds = sources.map(classifySource);
  const signalThresholds = signals.map((signal) => classifySignal({ signal, sourceThresholds }));

  return {
    schema: "tn12-attestation-reputation-thresholds/v1",
    network: attestationRegistry.network || "kaspa-testnet-12",
    status: "attestation-thresholds-ready",
    summary: {
      sources: sourceThresholds.length,
      signals: signalThresholds.length,
      influenceAllowedSources: sourceThresholds.filter((source) => source.influenceAllowed).length,
      reviewOnlySources: sourceThresholds.filter((source) => !source.influenceAllowed).length,
      influenceAllowedSignals: signalThresholds.filter((signal) => signal.influenceAllowed).length,
      staleOrUnresolvedSignals: signalThresholds.filter((signal) => signal.reviewReasons.includes("unresolved signal")).length
    },
    thresholds: {
      sourceReputationMinimum: 70,
      signatureVerifiedMinimum: 1,
      influenceReadyMinimum: 1,
      resolvedAccuracyMinimum: 70,
      stalePolicy: "Unresolved or unsigned signals can create review prompts only.",
      conflictPolicy: "Conflicting sources must be shown side by side until quorum and dispute rules are implemented."
    },
    sources: sourceThresholds,
    signals: signalThresholds,
    consumerPolicy: [
      {
        consumer: "oracle-risk-dashboard",
        allowedInput: "influenceAllowed signal summaries",
        blockedInput: "draft, unsigned, unresolved, or source-review-only signals"
      },
      {
        consumer: "prediction-hedge-simulator",
        allowedInput: "review-weighted signals only; no money settlement",
        blockedInput: "automatic settlement or liquidation"
      },
      {
        consumer: "miner-rtd-sampling",
        allowedInput: "signed watcher/pool messages after provenance review",
        blockedInput: "coinbase or miner policy claims without source-specific evidence"
      }
    ],
    boundaries: [
      "This is an app-level gating policy, not an oracle protocol.",
      "A high reputation score does not make a claim true.",
      "Signals can influence dashboards only after accepted payload evidence, verified signature, resolved accuracy, and source threshold checks pass.",
      "Custody, liquidation, and market settlement remain out of scope until oracle failure modes and dispute paths are explicit."
    ]
  };
}

function classifySource(source) {
  const reputationScore = Number(source.reputationScore || 0);
  const signatureVerified = Number(source.signatureVerified || 0);
  const influenceReady = Number(source.influenceReady || 0);
  const averageAccuracy = source.averageAccuracy === null ? null : Number(source.averageAccuracy);
  const influenceAllowed = reputationScore >= 70
    && signatureVerified >= 1
    && influenceReady >= 1
    && (averageAccuracy === null || averageAccuracy >= 70);

  return {
    source: source.source,
    sourceType: source.sourceType,
    reputationScore,
    averageAccuracy,
    signatureVerified,
    influenceReady,
    influenceAllowed,
    lane: influenceAllowed ? "dashboard-input" : "review-only",
    reviewReasons: [
      reputationScore < 70 ? "reputation below threshold" : "",
      signatureVerified < 1 ? "no verified signature" : "",
      influenceReady < 1 ? "no influence-ready accepted signal" : "",
      averageAccuracy !== null && averageAccuracy < 70 ? "resolved accuracy below threshold" : ""
    ].filter(Boolean)
  };
}

function classifySignal({ signal, sourceThresholds }) {
  const source = sourceThresholds.find((candidate) => candidate.source === signal.source);
  const resolved = signal.resolution?.status === "resolved";
  const influenceAllowed = Boolean(source?.influenceAllowed)
    && signal.influenceReady === true
    && resolved
    && Number(signal.resolution?.accuracy || 0) >= 70;

  return {
    id: signal.id,
    source: signal.source,
    eventId: signal.eventId,
    acceptedTxid: signal.acceptedTxid || "",
    influenceReady: signal.influenceReady === true,
    influenceAllowed,
    lane: influenceAllowed ? "dashboard-input" : "review-only",
    reviewReasons: [
      !source?.influenceAllowed ? "source review only" : "",
      signal.influenceReady !== true ? "signal not influence-ready" : "",
      !resolved ? "unresolved signal" : "",
      resolved && Number(signal.resolution?.accuracy || 0) < 70 ? "accuracy below threshold" : ""
    ].filter(Boolean)
  };
}
