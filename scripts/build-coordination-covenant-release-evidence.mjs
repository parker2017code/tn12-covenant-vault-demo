import { readFile, writeFile } from "node:fs/promises";

const fundingPath = process.env.COORDINATION_PLEDGE_FUNDING_DRAFT || "artifacts/signed-drafts/coordination-covenant-pledge-funding.json";
const outpointsPath = process.env.COORDINATION_PLEDGE_OUTPOINTS || "fixtures/CoordinationCovenantPledgeOutpoints.json";
const releaseDraftsPath = process.env.COORDINATION_RELEASE_DRAFTS || "artifacts/signed-drafts/coordination-covenant-release-spends.json";
const outPath = process.env.OUT || "artifacts/coordination-covenant-release-evidence.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const [fundingDraft, outpoints, releaseDrafts] = await Promise.all([
  readJson(fundingPath),
  readJson(outpointsPath),
  readJson(releaseDraftsPath)
]);

const releases = [];
for (const release of releaseDrafts.releases || []) {
  const txid = release.transactionId;
  const endpoint = `${endpointBase}/${txid}`;
  const response = await fetch(endpoint);
  const tx = response.ok ? await response.json() : null;
  releases.push({
    pledgeId: release.pledgeId,
    txid,
    endpoint,
    status: response.ok && tx?.is_accepted ? "accepted" : "not-found-or-not-accepted",
    explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
    destination: release.destination,
    amountTkas: release.amountTkas,
    amountSompi: release.amountSompi,
    acceptingBlockBlueScore: tx?.accepting_block_blue_score ?? null
  });
}

const acceptedReleases = releases.filter((row) => row.status === "accepted");
const artifact = {
  schema: "tn12-coordination-covenant-release-evidence/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: acceptedReleases.length === releases.length
    ? "accepted-covenant-release-spends"
    : acceptedReleases.length > 0
      ? "partial-accepted-covenant-release-spends"
      : "release-spends-not-accepted",
  funding: {
    txid: fundingDraft.transactionId,
    status: outpoints.status,
    pledgeOutputCount: outpoints.pledgeOutputCount,
    allPledgeOutputsHaveCovenantBinding: fundingDraft.checks?.allPledgeOutputsHaveCovenantBinding === true,
    explorerUrl: outpoints.fundingExplorerUrl
  },
  releases,
  summary: {
    pledgeOutputs: outpoints.pledgeOutputCount,
    releaseDrafts: releases.length,
    acceptedReleases: acceptedReleases.length
  },
  boundaries: [
    "This upgrades the pledge money movement only: fresh AssurancePledge covenant outputs release to the selected recipient.",
    "The coordination threshold and pack selection remain transparent replay/planner evidence.",
    "Do not describe this as private coordination, pooled custody, or protocol scheduling."
  ]
};

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} accepted=${artifact.summary.acceptedReleases}/${artifact.summary.releaseDrafts}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
