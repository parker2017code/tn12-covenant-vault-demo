const SOMPI_PER_TKAS = 100000000n;

export function buildBatchAssuranceCustodyDrafts({
  campaignState = {},
  checkpointIndex = {},
  minerFeeSompi = "5000"
} = {}) {
  const recordsByTxid = new Map((checkpointIndex.records || []).map((record) => [record.txid, record]));
  const acceptedInputs = (campaignState.releasePlan?.inputs || []).map((input) =>
    reviewCustodyInput({ input, record: recordsByTxid.get(input.sourceOutpoint?.txid) })
  );
  const eligibleInputs = acceptedInputs.filter((input) => input.status === "custody-input-ready");
  const blockedInputs = acceptedInputs.filter((input) => input.status !== "custody-input-ready");
  const requestedReleaseSompi = tkasToSompi(campaignState.releasePlan?.output?.amountTkas || 0);
  const eligibleInputSompi = eligibleInputs.reduce((sum, input) => sum + BigInt(input.observedAmountSompi), 0n);
  const feeSompi = BigInt(minerFeeSompi);
  const releaseOutputSompi = eligibleInputSompi > feeSompi ? eligibleInputSompi - feeSompi : 0n;
  const targetMet = Boolean(campaignState.summary?.acceptedTargetMet);
  const custodyReady = targetMet
    && blockedInputs.length === 0
    && eligibleInputs.length > 0
    && releaseOutputSompi === requestedReleaseSompi - feeSompi;

  return {
    schema: "tn12-batch-assurance-custody-drafts/v1",
    network: campaignState.network || checkpointIndex.network || "kaspa-testnet-12",
    status: custodyReady ? "custody-release-draft-ready" : "custody-draft-blocked",
    campaign: campaignState.campaign || {},
    summary: {
      requestedReleaseTkas: sompiToTkas(requestedReleaseSompi),
      eligibleInputTkas: sompiToTkas(eligibleInputSompi),
      blockedInputCount: blockedInputs.length,
      eligibleInputCount: eligibleInputs.length,
      minerFeeSompi: feeSompi.toString(),
      releaseOutputTkas: sompiToTkas(releaseOutputSompi),
      targetMet,
      custodyReady
    },
    releaseDraft: {
      status: custodyReady ? "review-ready-not-signed" : "blocked-until-custody-inputs-match",
      inputs: eligibleInputs.map(stripReviewOnlyFields),
      output: {
        address: campaignState.releasePlan?.output?.address || campaignState.campaign?.recipientAddress || "",
        amountSompi: releaseOutputSompi.toString(),
        amountTkas: sompiToTkas(releaseOutputSompi)
      },
      blockers: blockedInputs.map((input) => ({
        pledgeId: input.pledgeId,
        txid: input.txid,
        expectedAmountTkas: input.expectedAmountTkas,
        observedAmountTkas: input.observedAmountTkas,
        reason: input.reason
      }))
    },
    refundDrafts: buildRefundDrafts({ campaignState, recordsByTxid, minerFeeSompi: feeSompi }),
    boundaries: [
      "This artifact is a custody draft review, not a signed transaction.",
      "Accepted payload planner records do not become custody inputs unless the referenced output amount and txid match the pledge record.",
      "Current batch planner payloads prove app-state intent, not pooled covenant settlement.",
      "A production batch-assurance settlement must spend actual pledge outputs or script-enforced covenant outputs."
    ]
  };
}

function reviewCustodyInput({ input, record }) {
  const expectedSompi = tkasToSompi(input.amountTkas || 0);
  const observedSompi = BigInt(record?.output?.observed?.amountSompi || 0);
  const txid = input.sourceOutpoint?.txid || "";
  const amountMatches = expectedSompi === observedSompi;
  const recordMatched = Boolean(record?.matched);
  const status = recordMatched && amountMatches ? "custody-input-ready" : "custody-input-blocked";
  const reason = !recordMatched
    ? "No matched accepted transaction record for the pledge source outpoint."
    : amountMatches
      ? "Ready."
      : "Referenced accepted output amount does not match the pledge amount.";

  return {
    pledgeId: input.pledgeId,
    contributor: input.contributor,
    txid,
    outputIndex: Number(input.sourceOutpoint?.index || 0),
    status,
    reason,
    expectedAmountSompi: expectedSompi.toString(),
    expectedAmountTkas: sompiToTkas(expectedSompi),
    observedAmountSompi: observedSompi.toString(),
    observedAmountTkas: sompiToTkas(observedSompi),
    recordMatched
  };
}

function buildRefundDrafts({ campaignState, recordsByTxid, minerFeeSompi }) {
  return (campaignState.refundPlan?.refunds || []).map((refund) => {
    const input = reviewCustodyInput({
      input: {
        pledgeId: refund.pledgeId,
        contributor: refund.pledgeId,
        amountTkas: refund.amountTkas,
        sourceOutpoint: refund.sourceOutpoint
      },
      record: recordsByTxid.get(refund.sourceOutpoint?.txid)
    });
    const inputSompi = BigInt(input.observedAmountSompi);
    const outputSompi = input.status === "custody-input-ready" && inputSompi > minerFeeSompi
      ? inputSompi - minerFeeSompi
      : 0n;

    return {
      pledgeId: refund.pledgeId,
      status: input.status === "custody-input-ready" ? "review-ready-not-signed" : "blocked-until-custody-input-matches",
      input: stripReviewOnlyFields(input),
      output: {
        address: refund.refundAddress,
        amountSompi: outputSompi.toString(),
        amountTkas: sompiToTkas(outputSompi)
      },
      blocker: input.status === "custody-input-ready" ? null : input.reason
    };
  });
}

function stripReviewOnlyFields(input) {
  return {
    pledgeId: input.pledgeId,
    txid: input.txid,
    outputIndex: input.outputIndex,
    amountSompi: input.observedAmountSompi,
    amountTkas: input.observedAmountTkas
  };
}

function tkasToSompi(value) {
  const [whole, fraction = ""] = String(value || "0").split(".");
  const wholeSompi = BigInt(whole || "0") * SOMPI_PER_TKAS;
  const fractionSompi = BigInt(fraction.padEnd(8, "0").slice(0, 8) || "0");
  return wholeSompi + fractionSompi;
}

function sompiToTkas(sompi) {
  const value = BigInt(sompi);
  const whole = value / SOMPI_PER_TKAS;
  const fraction = value % SOMPI_PER_TKAS;
  if (fraction === 0n) return whole.toString();
  return `${whole}.${fraction.toString().padStart(8, "0").replace(/0+$/, "")}`;
}
