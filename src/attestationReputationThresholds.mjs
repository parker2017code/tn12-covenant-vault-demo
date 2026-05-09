export function buildAttestationReputationThresholds({
  attestationRegistry = {}
} = {}) {
  const sources = Array.isArray(attestationRegistry.sources) ? attestationRegistry.sources : [];
  const signals = Array.isArray(attestationRegistry.signals) ? attestationRegistry.signals : [];
  const sourceThresholds = sources.map(classifySource);
  const quorumThresholds = buildQuorumThresholds(signals);
  const signalThresholds = signals.map((signal) => classifySignal({ signal, sourceThresholds, quorumThresholds }));
  const dashboardInfluenceEnabled = signalThresholds.some((signal) => signal.influenceAllowed);

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
      staleOrUnresolvedSignals: signalThresholds.filter((signal) => ["stale", "unresolved"].includes(signal.state)).length,
      revokedSignals: signalThresholds.filter((signal) => signal.state === "revoked").length,
      conflictedEvents: quorumThresholds.filter((event) => event.conflictOpen).length,
      quorumPassedEvents: quorumThresholds.filter((event) => event.quorumMet).length,
      dashboardInfluenceEnabled
    },
    thresholds: {
      sourceReputationMinimum: 70,
      signatureVerifiedMinimum: 1,
      influenceReadyMinimum: 1,
      resolvedAccuracyMinimum: 70,
      quorumMinimum: 2,
      independentProvenanceMinimum: 2,
      stalePolicy: "Unresolved or unsigned signals can create review prompts only.",
      conflictPolicy: "Conflicting sources must be shown side by side and cannot influence dashboards until the conflict is resolved.",
      dashboardPolicy: "Dashboard influence stays disabled unless source, signature, provenance, quorum, conflict, fixture stale-state, revocation, and accuracy checks all pass."
    },
    quorumThresholds,
    sources: sourceThresholds,
    signals: signalThresholds,
    consumerPolicy: [
      {
        consumer: "oracle-risk-dashboard",
        allowedInput: "influenceAllowed signal summaries after quorum",
        blockedInput: "draft, unsigned, unresolved, stale, revoked, conflicted, below-quorum, or source-review-only signals"
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
      "Signals can influence dashboards only after accepted payload evidence, verified signature, active signer provenance, quorum, no open conflict, non-stale fixture state, resolved accuracy, and source threshold checks pass.",
      "Custody, liquidation, and market settlement remain out of scope until oracle failure modes and dispute paths are explicit."
    ]
  };
}

function classifySource(source) {
  const reputationScore = Number(source.reputationScore || 0);
  const signatureVerified = Number(source.signatureVerified || 0);
  const activeSignerProvenance = Number(source.activeSignerProvenance || 0);
  const revokedSigners = Number(source.revokedSigners || 0);
  const influenceReady = Number(source.influenceReady || 0);
  const averageAccuracy = source.averageAccuracy === null ? null : Number(source.averageAccuracy);
  const influenceAllowed = reputationScore >= 70
    && signatureVerified >= 1
    && activeSignerProvenance >= 1
    && revokedSigners === 0
    && influenceReady >= 1
    && (averageAccuracy === null || averageAccuracy >= 70);

  return {
    source: source.source,
    sourceType: source.sourceType,
    reputationScore,
    averageAccuracy,
    signatureVerified,
    activeSignerProvenance,
    revokedSigners,
    signerIds: source.signerIds || [],
    independenceGroups: source.independenceGroups || [],
    influenceReady,
    influenceAllowed,
    lane: influenceAllowed ? "dashboard-input" : "review-only",
    reviewReasons: [
      reputationScore < 70 ? "reputation below threshold" : "",
      signatureVerified < 1 ? "no verified signature" : "",
      activeSignerProvenance < 1 ? "no active signer provenance" : "",
      revokedSigners > 0 ? "revoked signer present" : "",
      influenceReady < 1 ? "no influence-ready accepted signal" : "",
      averageAccuracy !== null && averageAccuracy < 70 ? "resolved accuracy below threshold" : ""
    ].filter(Boolean)
  };
}

function buildQuorumThresholds(signals) {
  const events = new Map();
  for (const signal of signals) {
    const eventId = signal.eventId || "unknown-event";
    const event = events.get(eventId) || {
      eventId,
      signalIds: [],
      activeResolvedSignals: [],
      conflictingSignalIds: new Set(),
      independentProvenanceGroups: new Set()
    };
    event.signalIds.push(signal.id);
    const state = classifySignalState(signal);
    if (state === "conflicted") {
      event.conflictingSignalIds.add(signal.id);
    }
    for (const conflictId of signal.conflictsWith || []) {
      event.conflictingSignalIds.add(signal.id);
      event.conflictingSignalIds.add(conflictId);
    }
    if (state === "resolved" && signal.influenceReady === true && Number(signal.resolution?.accuracy || 0) >= 70) {
      event.activeResolvedSignals.push(signal.id);
      event.independentProvenanceGroups.add(signal.signerProvenance?.independenceGroup || signal.source);
    }
    events.set(eventId, event);
  }

  return [...events.values()].map((event) => {
    const independentProvenanceGroups = [...event.independentProvenanceGroups];
    const conflictIds = [...event.conflictingSignalIds];
    const quorumMet = event.activeResolvedSignals.length >= 2
      && independentProvenanceGroups.length >= 2
      && conflictIds.length === 0;
    return {
      eventId: event.eventId,
      signalIds: event.signalIds,
      activeResolvedSignals: event.activeResolvedSignals,
      independentProvenanceGroups,
      quorumMet,
      conflictOpen: conflictIds.length > 0,
      conflictingSignalIds: conflictIds,
      reviewReasons: [
        event.activeResolvedSignals.length < 2 ? "below signal quorum" : "",
        independentProvenanceGroups.length < 2 ? "below independent provenance quorum" : "",
        conflictIds.length > 0 ? "open signal conflict" : ""
      ].filter(Boolean)
    };
  });
}

function classifySignal({ signal, sourceThresholds, quorumThresholds }) {
  const source = sourceThresholds.find((candidate) => candidate.source === signal.source);
  const resolved = signal.resolution?.status === "resolved";
  const state = classifySignalState(signal);
  const quorum = quorumThresholds.find((candidate) => candidate.eventId === signal.eventId);
  const influenceAllowed = Boolean(source?.influenceAllowed)
    && signal.influenceReady === true
    && resolved
    && state === "resolved"
    && Number(signal.resolution?.accuracy || 0) >= 70
    && Boolean(quorum?.quorumMet);

  return {
    id: signal.id,
    source: signal.source,
    eventId: signal.eventId,
    acceptedTxid: signal.acceptedTxid || "",
    signerProvenance: signal.signerProvenance,
    state,
    conflictsWith: signal.conflictsWith || [],
    quorumMet: Boolean(quorum?.quorumMet),
    influenceReady: signal.influenceReady === true,
    influenceAllowed,
    lane: influenceAllowed ? "dashboard-input" : "review-only",
    reviewReasons: [
      !source?.influenceAllowed ? "source review only" : "",
      signal.influenceReady !== true ? "signal not influence-ready" : "",
      state === "unresolved" ? "unresolved signal" : "",
      state === "stale" ? "stale signal" : "",
      state === "revoked" ? "revoked signer" : "",
      state === "conflicted" ? "conflicted signal" : "",
      resolved && Number(signal.resolution?.accuracy || 0) < 70 ? "accuracy below threshold" : "",
      !quorum?.quorumMet ? "event quorum not met" : ""
    ].filter(Boolean)
  };
}

function classifySignalState(signal) {
  if (signal.signerProvenance?.status === "revoked") return "revoked";
  if (signal.resolution?.status === "stale") return "stale";
  if (signal.conflictsWith?.length > 0 || String(signal.claimPosition || "").startsWith("conflicts-with")) return "conflicted";
  if (signal.resolution?.status !== "resolved") return "unresolved";
  return "resolved";
}
