const SOMPI_PER_TKAS = 100000000n;

export function buildBatchAssuranceCustodyRequirements({
  campaignState = {},
  checkpointIndex = {},
  custodyDrafts = {}
} = {}) {
  const recordsByTxid = new Map((checkpointIndex.records || []).map((record) => [record.txid, record]));
  const requirements = (campaignState.releasePlan?.inputs || []).map((input) =>
    buildPledgeRequirement({ input, record: recordsByTxid.get(input.sourceOutpoint?.txid) })
  );
  const readyRequirements = requirements.filter((requirement) => requirement.status === "custody-input-ready");
  const blockedRequirements = requirements.filter((requirement) => requirement.status !== "custody-input-ready");
  const requiredSompi = requirements.reduce((sum, requirement) => sum + BigInt(requirement.required.amountSompi), 0n);
  const observedSompi = requirements.reduce((sum, requirement) => sum + BigInt(requirement.currentReference.observedAmountSompi), 0n);
  const amountMatchedSompi = readyRequirements.reduce((sum, requirement) => sum + BigInt(requirement.currentReference.observedAmountSompi), 0n);
  const missingSompi = requiredSompi > amountMatchedSompi ? requiredSompi - amountMatchedSompi : 0n;

  return {
    schema: "tn12-batch-assurance-custody-requirements/v1",
    network: campaignState.network || checkpointIndex.network || "kaspa-testnet-12",
    status: blockedRequirements.length === 0 && requirements.length > 0
      ? "custody-requirements-satisfied"
      : "custody-requirements-open",
    campaign: campaignState.campaign || {},
    summary: {
      pledgeOutputCount: requirements.length,
      readyCount: readyRequirements.length,
      blockedCount: blockedRequirements.length,
      requiredTkas: sompiToTkas(requiredSompi),
      observedReferencedTkas: sompiToTkas(observedSompi),
      amountMatchedTkas: sompiToTkas(amountMatchedSompi),
      missingMatchedTkas: sompiToTkas(missingSompi),
      custodyDraftStatus: custodyDrafts.status || "not-built"
    },
    requirements,
    acceptanceCriteria: [
      "Each release input must reference an accepted TN12 transaction output.",
      "The referenced output amount must equal the pledge amount before miner fee accounting.",
      "Each pledge outpoint must be unique across the campaign.",
      "Payload-only planner transactions can prove campaign state, but they do not satisfy custody input requirements.",
      "Submit must use a payload-preserving TN12 route for payload events and a transaction route that preserves version-1 compute budget fields for covenant spends."
    ],
    nextBuilds: [
      {
        id: "pledge-output-draft-builder",
        status: "needed",
        detail: "Create signed or wallet-reviewable pledge output drafts for the exact required amounts."
      },
      {
        id: "pledge-output-tn12-submit",
        status: "needed",
        detail: "Submit the pledge output drafts on TN12 and record the accepted txids."
      },
      {
        id: "campaign-fixture-import",
        status: "needed",
        detail: "Replace planner payload outpoints with the accepted amount-matched pledge output outpoints."
      },
      {
        id: "custody-release-rebuild",
        status: "blocked",
        detail: "Rerun `npm run campaign:custody` only after the accepted pledge outputs match the campaign amounts."
      }
    ],
    boundaries: [
      "This artifact is a checklist for the next TN12 custody transactions.",
      "It is not a settlement proof and does not make the batch release spendable.",
      "The current accepted pledge payloads remain valid app-state evidence only."
    ]
  };
}

function buildPledgeRequirement({ input, record }) {
  const expectedSompi = tkasToSompi(input.amountTkas || 0);
  const observedSompi = BigInt(record?.output?.observed?.amountSompi || 0);
  const recordMatched = Boolean(record?.matched);
  const amountMatches = recordMatched && expectedSompi === observedSompi;
  const txid = input.sourceOutpoint?.txid || "";
  const outputIndex = Number(input.sourceOutpoint?.index || 0);
  const blockers = [
    !recordMatched ? "No accepted transaction record matched this source txid." : "",
    recordMatched && !amountMatches ? "Accepted transaction exists, but output amount does not match the pledge." : ""
  ].filter(Boolean);

  return {
    pledgeId: input.pledgeId,
    contributor: input.contributor,
    status: amountMatches ? "custody-input-ready" : "custody-input-blocked",
    required: {
      amountSompi: expectedSompi.toString(),
      amountTkas: sompiToTkas(expectedSompi),
      sourceKind: "accepted-pledge-output",
      outputIndex
    },
    currentReference: {
      txid,
      outputIndex,
      acceptedTxid: input.acceptedTxid || null,
      recordMatched,
      observedAmountSompi: observedSompi.toString(),
      observedAmountTkas: sompiToTkas(observedSompi),
      amountMatches
    },
    next: amountMatches
      ? "Use this outpoint in the custody release draft after duplicate-source review."
      : "Build and submit an accepted TN12 pledge output with this exact amount, then import that outpoint into the campaign fixture.",
    blockers
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
