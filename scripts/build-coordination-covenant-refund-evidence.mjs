import { readFile, writeFile } from "node:fs/promises";

const fundingPath = process.env.COORDINATION_REFUND_PLEDGE_FUNDING_DRAFT || "artifacts/signed-drafts/coordination-covenant-refund-pledge-funding.json";
const outpointsPath = process.env.COORDINATION_REFUND_PLEDGE_OUTPOINTS || "fixtures/CoordinationCovenantRefundPledgeOutpoints.json";
const refundDraftsPath = process.env.COORDINATION_REFUND_DRAFTS || "artifacts/signed-drafts/coordination-covenant-refund-spends.json";
const releaseEvidencePath = process.env.COORDINATION_RELEASE_EVIDENCE || "artifacts/coordination-covenant-release-evidence.json";
const outPath = process.env.OUT || "artifacts/coordination-covenant-refund-evidence.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const [fundingDraft, outpoints, refundDrafts, releaseEvidence] = await Promise.all([
  readJson(fundingPath),
  readJson(outpointsPath),
  readJson(refundDraftsPath),
  readOptionalJson(releaseEvidencePath)
]);

const refunds = [];
for (const refund of refundDrafts.refunds || []) {
  const txid = refund.transactionId;
  const endpoint = `${endpointBase}/${txid}`;
  const response = await fetch(endpoint);
  const tx = response.ok ? await response.json() : null;
  refunds.push({
    pledgeId: refund.pledgeId,
    txid,
    endpoint,
    status: response.ok && tx?.is_accepted ? "accepted" : "not-found-or-not-accepted",
    explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
    destination: refund.destination,
    amountTkas: refund.amountTkas,
    amountSompi: refund.amountSompi,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null
  });
}

const acceptedRefunds = refunds.filter((row) => row.status === "accepted");
const acceptedReleaseCount = releaseEvidence?.summary?.acceptedReleases || 0;
const artifact = {
  schema: "tn12-coordination-covenant-refund-evidence/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: acceptedRefunds.length === refunds.length
    ? "accepted-covenant-refund-spends"
    : acceptedRefunds.length > 0
      ? "partial-accepted-covenant-refund-spends"
      : "refund-spends-not-accepted",
  funding: {
    txid: fundingDraft.transactionId,
    status: outpoints.status,
    pledgeOutputCount: outpoints.pledgeOutputCount,
    allPledgeOutputsHaveCovenantBinding: fundingDraft.checks?.allPledgeOutputsHaveCovenantBinding === true,
    explorerUrl: outpoints.fundingExplorerUrl
  },
  refunds,
  summary: {
    pledgeOutputs: outpoints.pledgeOutputCount,
    refundDrafts: refunds.length,
    acceptedRefunds: acceptedRefunds.length,
    acceptedReleaseSpendsOnSeparateFreshOutputs: acceptedReleaseCount
  },
  boundaries: [
    "This proves the AssurancePledge refund route on a separate fresh pledge set from the release proof.",
    "Release and refund are mutually exclusive for a single pledge output; the repo uses separate fresh outputs to demonstrate both accepted paths.",
    "The coordination threshold and pack selection remain transparent replay/planner evidence."
  ]
};

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} accepted=${artifact.summary.acceptedRefunds}/${artifact.summary.refundDrafts}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch {
    return null;
  }
}
