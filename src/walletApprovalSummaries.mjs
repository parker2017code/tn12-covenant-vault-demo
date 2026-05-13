export function buildWalletApprovalSummaries({
  resetProof = {},
  resetDraft = {},
  continuation = {},
  siblingDiscovery = {},
  muxLiveFlow = {},
  muxChallenge = {},
  schedulerPayout = {},
  schedulerTarget = {},
  schedulerNegatives = {},
  coordinationRelease = {},
  coordinationRefund = {},
  heistEvidence = {},
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

  const summaries = [
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
        },
        postResetSpend: {
          txid: accepted.postResetSpendTxid || "",
          explorerUrl: accepted.postResetSpendTxid ? `https://tn12.kaspa.stream/transactions/${accepted.postResetSpendTxid}` : "",
          continuationOutpoint: accepted.postResetContinuationOutpoint || "",
          nextSpentInWindow: String(resetProof.state?.postResetSpend?.nextSpentSompi ?? "")
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
  ];

  if (siblingDiscovery.status) {
    summaries.push(buildSiblingAssetSummary(siblingDiscovery));
  }

  if (muxLiveFlow.status || muxChallenge.status) {
    summaries.push(buildMuxWorkerSummary(muxLiveFlow, muxChallenge));
  }

  if (schedulerPayout.status === "accepted-covenant-payout-spend") {
    summaries.push(buildSchedulerPayoutSummary(schedulerPayout, schedulerTarget, schedulerNegatives));
  }

  if (coordinationRelease.status === "accepted-covenant-release-spends") {
    summaries.push(buildCoordinationReleaseSummary(coordinationRelease, coordinationRefund));
  }

  if (heistEvidence.status === "accepted-vault-rail-with-local-heist-rejects") {
    summaries.push(buildVaultNegativeSummary(heistEvidence));
  }

  return {
    schema: "tn12-wallet-approval-summaries/v1",
    network: "kaspa-testnet-12",
    generatedAt,
    status: acceptedReset && localRejects.length >= 3 && summaries.length >= 3
      ? "wallet-approval-summary-ready"
      : "wallet-approval-summary-review",
    purpose: "Translate covenant evidence into fields a wallet could show before Approve/Reject.",
    summaries
  };
}

function buildCoordinationReleaseSummary(releaseEvidence, refundEvidence = {}) {
  const releases = Array.isArray(releaseEvidence.releases) ? releaseEvidence.releases : [];
  const refunds = Array.isArray(refundEvidence.refunds) ? refundEvidence.refunds : [];
  const totalSompi = releases.reduce((sum, row) => sum + BigInt(row.amountSompi || "0"), 0n);
  const refundSompi = refunds.reduce((sum, row) => sum + BigInt(row.amountSompi || "0"), 0n);
  return {
    id: "coordination-covenant-release",
    experiment: "coordination-release-evidence",
    evidenceClass: "TN12_ACCEPTED_SCRIPT_ENFORCED_WITH_REPLAY_SELECTION",
    recommendedWalletDecision: "approve-if-user-initiated",
    title: "Release coordination pledges",
    plainAction: `Release ${releases.length} covenant pledges totaling ${sompiToTkas(totalSompi)} tKAS to the selected recipient after the coordination pack is selected by replay evidence.`,
    userChecks: [
      `Funding txid: ${releaseEvidence.funding?.txid || ""}`,
      `Pledge outputs: ${releaseEvidence.funding?.pledgeOutputCount ?? ""}`,
      `Accepted releases: ${releaseEvidence.summary?.acceptedReleases ?? releases.length}`,
      `Accepted refunds on separate fresh pledge set: ${refundEvidence.summary?.acceptedRefunds ?? refunds.length}`,
      `Recipient: ${releases[0]?.destination || ""}`,
      `Total released: ${sompiToTkas(totalSompi)} tKAS`,
      `Refund proof total: ${sompiToTkas(refundSompi)} tKAS`
    ],
    technicalChecks: {
      funding: releaseEvidence.funding || {},
      refundFunding: refundEvidence.funding || {},
      releases,
      refunds,
      summary: releaseEvidence.summary || {}
    },
    refusalPrompts: [
      {
        id: "non-selected-refund-after-release",
        recommendedWalletDecision: "reject",
        evidenceClass: "REPLAY_BRANCH_REJECT",
        reason: "refund alternates are not promoted after the pledge outputs release"
      }
    ],
    boundaries: releaseEvidence.boundaries || []
  };
}

function buildVaultNegativeSummary(heist) {
  const rows = Array.isArray(heist.rows) ? heist.rows : [];
  return {
    id: "vault-negative-checks",
    experiment: "vault-negative-checks",
    evidenceClass: "TN12_ACCEPTED_BACKBONE_WITH_LOCAL_REJECTS",
    recommendedWalletDecision: "reject-invalid-attempts",
    title: "Review blocked vault attempts",
    plainAction: `Review ${rows.length} blocked vault attempts over the accepted recurring-vault rail before treating the vault path as safe to automate.`,
    userChecks: [
      `Accepted reset txid: ${heist.acceptedBackbone?.resetTxid || ""}`,
      `Blocked attempts: ${rows.length}`,
      `Wrong destination row: ${rows.find((row) => row.id === "wrong-destination")?.status || ""}`,
      `Missing continuation row: ${rows.find((row) => row.id === "missing-continuation")?.status || ""}`,
      `Over-cap row: ${rows.find((row) => row.id === "cumulative-over-cap")?.status || ""}`
    ],
    technicalChecks: {
      acceptedBackbone: heist.acceptedBackbone || {},
      sourceArtifacts: heist.sourceArtifacts || {},
      rows
    },
    refusalPrompts: rows.map((row) => ({
      id: row.id,
      recommendedWalletDecision: "reject",
      evidenceClass: row.class || "SCRIPT_ENFORCED_LOCAL",
      reason: row.rule,
      artifact: row.evidence || ""
    })),
    boundaries: heist.doesNotProve || []
  };
}

function buildSchedulerPayoutSummary(payout, target, negatives) {
  const localRejects = Array.isArray(negatives?.cases)
    ? negatives.cases.filter((row) => row.expected === false)
    : [];
  return {
    id: "scheduler-covenant-payout",
    experiment: "scheduler-receipt-evidence",
    evidenceClass: "TN12_ACCEPTED_SCRIPT_ENFORCED_WITH_REPLAY_GUARDS",
    recommendedWalletDecision: "approve-if-user-initiated",
    title: "Release scheduler covenant payout",
    plainAction: `Release ${payout.release?.amountTkas || ""} tKAS to the scheduled recipient after the accepted intent, winning bid, and execution receipt are replayed as eligible.`,
    userChecks: [
      `Payout amount: ${payout.release?.amountTkas || ""} tKAS`,
      `Recipient: ${payout.release?.destination || ""}`,
      `Funding txid: ${payout.funding?.txid || ""}`,
      `Release txid: ${payout.release?.txid || ""}`,
      `Intent txid: ${payout.schedulerContext?.intentTxid || ""}`,
      `Winning bid txid: ${payout.schedulerContext?.winningBidTxid || ""}`
    ],
    technicalChecks: {
      funding: payout.funding || {},
      release: payout.release || {},
      schedulerContext: payout.schedulerContext || {},
      scriptEnforces: payout.summary?.scriptEnforces || [],
      replayStillChecks: payout.summary?.replayStillChecks || target.targetV1?.replayMustStillCheck || []
    },
    refusalPrompts: [
      {
        id: "stale-or-duplicate-scheduler-row",
        recommendedWalletDecision: "reject",
        evidenceClass: "INDEXER_DERIVED_REJECT",
        reason: "replay marks the trigger source stale or the execution duplicate"
      },
      ...localRejects.map((row) => ({
        id: row.id,
        recommendedWalletDecision: "reject",
        evidenceClass: "LOCAL_SCRIPT_ENGINE_REJECT",
        reason: row.id.replaceAll("_", " "),
        candidateTxid: row.transactionId || ""
      }))
    ],
    boundaries: [
      "This is a wallet-readable summary for an accepted TN12 covenant payout.",
      "The payout spend is covenant-enforced; scheduler eligibility remains replay/indexer-derived.",
      "This does not prove protocol scheduling, autonomous custody, wallet-standard signing, or mainnet readiness."
    ]
  };
}

function buildSiblingAssetSummary(discovery) {
  return {
    id: "sibling-asset-strike",
    experiment: "sibling-authorized-asset-proof",
    evidenceClass: "TN12_ACCEPTED_SCRIPT_ENFORCED_WITH_LOCAL_REJECTS",
    recommendedWalletDecision: "approve-if-user-initiated",
    title: "Move asset with sibling authority",
    plainAction: `Use owner-marker input ${discovery.selectedCandidate?.outpoint || ""} to authorize the asset strike and update power ${discovery.acceptedStrike?.powerBefore ?? ""} -> ${discovery.acceptedStrike?.powerAfter ?? ""}.`,
    userChecks: [
      `Required owner covenant id: ${discovery.requiredSibling?.covenantId || ""}`,
      `Required sibling input index: ${discovery.requiredSibling?.witnessInput ?? ""}`,
      `Selected sibling outpoint: ${discovery.selectedCandidate?.outpoint || ""}`,
      `Asset input covenant id: ${discovery.assetInput?.covenantId || ""}`,
      `Accepted strike txid: ${discovery.acceptedStrike?.txid || ""}`
    ],
    technicalChecks: {
      requiredSibling: discovery.requiredSibling || {},
      selectedCandidate: discovery.selectedCandidate || {},
      assetInput: discovery.assetInput || {},
      acceptedStrike: discovery.acceptedStrike || {}
    },
    refusalPrompts: (discovery.localRejectCoverage || []).map((item) => ({
      id: item.name,
      recommendedWalletDecision: "reject",
      evidenceClass: "LOCAL_SCRIPT_ENGINE_REJECT",
      reason: item.name.replaceAll("_", " "),
      got: item.got,
      expected: item.expected
    })),
    boundaries: discovery.boundaries || []
  };
}

function buildMuxWorkerSummary(liveFlow, challenge) {
  const acceptedFlow = Array.isArray(liveFlow.acceptedFlow) ? liveFlow.acceptedFlow : [];
  const route = acceptedFlow.find((item) => item.step === "route-to-worker-a") || {};
  const workerReturn = acceptedFlow.find((item) => item.step === "worker-a-return-to-mux") || {};
  const timeout = acceptedFlow.find((item) => item.step === "worker-a-timeout-to-mux") || {};
  const workerBReturn = acceptedFlow.find((item) => item.step === "worker-b-return-to-mux") || {};
  const challengeRows = Array.isArray(challenge.rows) ? challenge.rows : [];

  return {
    id: "mux-worker-route-timeout",
    experiment: "mux-worker-proof",
    evidenceClass: "TN12_ACCEPTED_SCRIPT_ENFORCED_WITH_LOCAL_REJECTS",
    recommendedWalletDecision: "approve-if-user-initiated",
    title: "Route mux state to worker and return",
    plainAction: `Route the covenant family through worker templates and return to mux; accepted values move ${route.state?.value ?? ""} -> ${workerReturn.state?.valueAfter ?? ""}, timeout returns ${timeout.state?.valueBefore ?? ""} -> ${timeout.state?.valueAfter ?? ""}, and Worker B returns ${workerBReturn.state?.valueBefore ?? ""} -> ${workerBReturn.state?.valueAfter ?? ""}.`,
    userChecks: [
      `Covenant family id: ${liveFlow.contractFamily?.covenantId || challenge.contractFamily?.covenantId || ""}`,
      `Mux template: ${liveFlow.contractFamily?.templates?.mux || challenge.contractFamily?.templates?.mux || ""}`,
      `Worker A template: ${liveFlow.contractFamily?.templates?.a || challenge.contractFamily?.templates?.a || ""}`,
      `Worker B template: ${liveFlow.contractFamily?.templates?.b || challenge.contractFamily?.templates?.b || ""}`,
      `Accepted route txid: ${route.txid || ""}`,
      `Accepted timeout txid: ${timeout.txid || ""}`
    ],
    technicalChecks: {
      family: liveFlow.contractFamily || challenge.contractFamily || {},
      normalWorkerReturn: {
        txid: workerReturn.txid || "",
        explorerUrl: workerReturn.explorerUrl || "",
        state: workerReturn.state || {}
      },
      timeoutSettlement: {
        txid: timeout.txid || "",
        explorerUrl: timeout.explorerUrl || "",
        state: timeout.state || {}
      },
      workerBSettlement: {
        txid: workerBReturn.txid || "",
        explorerUrl: workerBReturn.explorerUrl || "",
        state: workerBReturn.state || {}
      }
    },
    refusalPrompts: challengeRows
      .filter((row) => row.status === "blocked-local-engine-failed")
      .map((row) => ({
        id: row.id,
        recommendedWalletDecision: "reject",
        evidenceClass: "LOCAL_SCRIPT_ENGINE_REJECT",
        reason: row.rule,
        result: row.result
      })),
    boundaries: [
      "This is a wallet-readable summary for a TN12/testnet mux-worker primitive.",
      "It does not prove full game rules or production settlement.",
      "Local challenge rows are script-engine evidence, not broadcast-rejected TN12 invalid transactions."
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
