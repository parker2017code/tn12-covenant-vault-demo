const SOMPI_PER_TKAS = 100000000n;

export function buildBatchAssuranceCustodyImports({
  importFixture = {},
  campaignState = {},
  custodyRequirements = {},
  checkpointIndex = {}
} = {}) {
  const campaign = campaignState.campaign || custodyRequirements.campaign || {};
  const requirementsByPledge = new Map((custodyRequirements.requirements || []).map((requirement) => [
    requirement.pledgeId,
    requirement
  ]));
  const campaignPledgesById = new Map((campaignState.pledges || []).map((pledge) => [
    pledge.pledgeId,
    pledge
  ]));
  const recordsByTxid = new Map((checkpointIndex.records || []).map((record) => [record.txid, record]));
  const duplicateOutpoints = buildDuplicateOutpointMap(importFixture.imports || []);
  const imports = (importFixture.imports || []).map((row) => validateImportRow({
    row,
    campaign,
    requirement: requirementsByPledge.get(row.pledgeId),
    campaignPledge: campaignPledgesById.get(row.pledgeId),
    recordsByTxid,
    duplicateOutpoints
  }));
  const readyImports = imports.filter((row) => row.status === "custody-import-ready");
  const blockedImports = imports.filter((row) => row.status !== "custody-import-ready");
  const requiredPledgeIds = new Set(requirementsByPledge.keys());
  const readyPledgeIds = new Set(readyImports.map((row) => row.pledgeId));
  const missingRequiredImports = [...requiredPledgeIds].filter((pledgeId) => !readyPledgeIds.has(pledgeId));
  const requirementsSatisfied = requiredPledgeIds.size > 0
    && missingRequiredImports.length === 0
    && blockedImports.length === 0;

  return {
    schema: "tn12-batch-assurance-custody-imports/v1",
    network: importFixture.network || campaignState.network || custodyRequirements.network || "kaspa-testnet-12",
    status: requirementsSatisfied ? "custody-imports-ready" : "custody-imports-blocked-review",
    campaign,
    sourceStatus: importFixture.status || "unknown",
    summary: {
      importCount: imports.length,
      readyCount: readyImports.length,
      blockedCount: blockedImports.length,
      requiredPledgeCount: requiredPledgeIds.size,
      missingRequiredImports: missingRequiredImports.length,
      plannerPayloadOnlyCount: imports.filter((row) => row.checks.plannerPayloadOnly).length,
      duplicateOutpointCount: imports.filter((row) => row.checks.duplicateOutpoint).length,
      belowMinimumCount: imports.filter((row) => row.checks.meetsMinimum === false).length,
      acceptedEvidenceMissingCount: imports.filter((row) => row.checks.acceptedEvidencePresent === false).length,
      requirementsSatisfied
    },
    imports,
    missingRequiredImports,
    acceptanceCriteria: [
      "Pledge id must exist in the campaign custody requirements.",
      "Pasted amount must match the required pledge amount.",
      "Outpoint txid and output index must both be present.",
      "Accepted evidence must exist in the accepted-index checkpoint.",
      "The same outpoint cannot appear twice in the import batch.",
      "Below-minimum pledges cannot become custody inputs.",
      "Accepted planner payload records cannot be promoted into custody outputs."
    ],
    boundaries: [
      "This validator only reviews pasted/imported custody outpoints.",
      "It does not mutate the campaign fixture.",
      "It does not mark batch release ready unless every required pledge has an accepted amount-matched non-payload custody outpoint.",
      "Current fixture rows intentionally remain blocked because the repo lacks real matching custody outputs."
    ],
    next: requirementsSatisfied
      ? "Review the ready imports, update the campaign fixture intentionally, then rerun custody drafts."
      : "Create accepted TN12 pledge outputs for the required amounts, paste those outpoints here, then rerun this validator."
  };
}

function validateImportRow({
  row,
  campaign,
  requirement,
  campaignPledge,
  recordsByTxid,
  duplicateOutpoints
}) {
  const pledgeId = String(row.pledgeId || "");
  const amountSompi = tkasToSompi(row.amountTkas || row.amount || "0");
  const txid = String(row.outpoint?.txid || "");
  const hasIndex = row.outpoint && Object.hasOwn(row.outpoint, "index");
  const outputIndex = hasIndex ? Number(row.outpoint.index) : null;
  const outpointValid = isHex64(txid) && Number.isInteger(outputIndex) && outputIndex >= 0;
  const acceptedEvidenceTxid = String(row.acceptedEvidenceTxid || row.acceptedTxid || "");
  const evidenceLookupTxid = isHex64(acceptedEvidenceTxid) ? acceptedEvidenceTxid : txid;
  const evidenceRecord = recordsByTxid.get(evidenceLookupTxid);
  const requiredSompi = BigInt(requirement?.required?.amountSompi || 0);
  const campaignMinimumSompi = tkasToSompi(campaign.minimumPledgeTkas || 0);
  const amountMatchesRequirement = Boolean(requirement) && amountSompi === requiredSompi;
  const meetsMinimum = amountSompi >= campaignMinimumSompi;
  const duplicateOutpoint = outpointValid && duplicateOutpoints.get(outpointKey({ txid, index: outputIndex })) > 1;
  const acceptedEvidencePresent = Boolean(evidenceRecord?.matched);
  const plannerPayloadOnly = acceptedEvidencePresent && (
    evidenceRecord.kind === "payload-event"
    || campaignPledge?.status === "accepted-payload-indexed"
    || campaignPledge?.acceptedTxid === txid
  );
  const problems = [
    !requirement ? "pledge id is not required by the current campaign custody plan" : "",
    !amountMatchesRequirement ? "amount does not match required pledge amount" : "",
    !isHex64(txid) ? "missing or invalid outpoint txid" : "",
    !hasIndex || !Number.isInteger(outputIndex) || outputIndex < 0 ? "missing or invalid outpoint index" : "",
    !isHex64(acceptedEvidenceTxid) ? "missing or invalid accepted evidence txid" : "",
    !acceptedEvidencePresent ? "accepted evidence not found in checkpoint" : "",
    duplicateOutpoint ? "duplicate pasted outpoint" : "",
    !meetsMinimum ? `below minimum pledge of ${sompiToTkas(campaignMinimumSompi)} TKAS` : "",
    plannerPayloadOnly ? "accepted planner payload record is not a custody output" : ""
  ].filter(Boolean);

  return {
    pledgeId,
    label: String(row.label || pledgeId),
    status: problems.length === 0 ? "custody-import-ready" : "custody-import-review",
    source: String(row.source || "manual paste"),
    note: String(row.note || ""),
    amount: {
      pastedTkas: sompiToTkas(amountSompi),
      pastedSompi: amountSompi.toString(),
      requiredTkas: sompiToTkas(requiredSompi),
      requiredSompi: requiredSompi.toString()
    },
    outpoint: {
      txid,
      index: outputIndex
    },
    acceptedEvidence: {
      txid: acceptedEvidenceTxid,
      lookupTxid: evidenceLookupTxid,
      present: acceptedEvidencePresent,
      kind: evidenceRecord?.kind || "missing",
      matched: Boolean(evidenceRecord?.matched)
    },
    checks: {
      pledgeRequired: Boolean(requirement),
      amountMatchesRequirement,
      hasOutpointTxid: isHex64(txid),
      hasOutpointIndex: Number.isInteger(outputIndex) && outputIndex >= 0,
      acceptedEvidencePresent,
      duplicateOutpoint,
      meetsMinimum,
      plannerPayloadOnly
    },
    problems
  };
}

function buildDuplicateOutpointMap(rows) {
  const map = new Map();
  for (const row of rows) {
    const txid = String(row.outpoint?.txid || "");
    const index = Number(row.outpoint?.index);
    if (isHex64(txid) && Number.isInteger(index) && index >= 0) {
      const key = outpointKey({ txid, index });
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map;
}

function outpointKey(outpoint) {
  return `${outpoint.txid}:${outpoint.index}`;
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

function isHex64(value) {
  return /^[0-9a-f]{64}$/i.test(String(value || ""));
}
