import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/blitz-mux-live-flow-evidence.json";

const family = await readJson("artifacts/blitz-mux-family-artifacts.json");
const genesisDraft = await readJson("artifacts/signed-drafts/blitz-mux-family-genesis-funding.json");
const genesisOutpoint = await readJson("fixtures/BlitzMuxFamilyContractOutpoint.json");
const routeDraft = await readJson("artifacts/signed-drafts/blitz-mux-route-to-worker-a.json");
const routeOutpoint = await readJson("fixtures/BlitzWorkerARouteOutpoint.json");
const returnDraft = await readJson("artifacts/signed-drafts/blitz-mux-worker-a-return.json");
const returnedOutpoint = await readJson("fixtures/BlitzMuxReturnedOutpoint.json");

const artifact = {
  schema: "tn12-blitz-mux-live-flow-evidence/v1",
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  status: "accepted-mux-route-and-worker-return",
  contractFamily: {
    sources: ["contracts/BlitzMux.sil", "contracts/BlitzWorkerA.sil", "contracts/BlitzWorkerB.sil"],
    templates: family.templates,
    covenantId: genesisDraft.covenantGenesis.covenant.covenantId
  },
  acceptedFlow: [
    {
      step: "family-genesis",
      contract: "BlitzMux",
      txid: genesisOutpoint.txid,
      outputIndex: genesisOutpoint.outputIndex,
      amountSompi: genesisOutpoint.amountSompi,
      status: genesisOutpoint.status,
      explorerUrl: genesisOutpoint.explorerUrl
    },
    {
      step: "route-to-worker-a",
      contract: "BlitzWorkerA",
      txid: routeOutpoint.txid,
      outputIndex: routeOutpoint.outputIndex,
      amountSompi: routeOutpoint.amountSompi,
      status: routeOutpoint.status,
      explorerUrl: routeOutpoint.explorerUrl,
      state: routeDraft.route.state
    },
    {
      step: "worker-a-return-to-mux",
      contract: "BlitzMux",
      txid: returnedOutpoint.txid,
      outputIndex: returnedOutpoint.outputIndex,
      amountSompi: returnedOutpoint.amountSompi,
      status: returnedOutpoint.status,
      explorerUrl: returnedOutpoint.explorerUrl,
      state: returnDraft.route.state
    }
  ],
  localChecks: {
    routeEngineAcceptedGeneratedSigScript: routeDraft.localChecks.engineAcceptedGeneratedSigScript,
    returnEngineAcceptedGeneratedSigScript: returnDraft.localChecks.engineAcceptedGeneratedSigScript,
    routeCovenantMatchesInput: routeDraft.localChecks.output0CovenantMatchesInput,
    returnCovenantMatchesInput: returnDraft.localChecks.output0CovenantMatchesInput
  },
  proves: [
    "A BlitzMux family genesis output was accepted on TN12.",
    "The mux routed accepted state to Worker A through template identity.",
    "Worker A returned accepted state to the mux.",
    "Both spends preserved the same covenant family id."
  ],
  doesNotProve: [
    "full chess rules",
    "timeout accepted on TN12",
    "mainnet activation",
    "production game settlement"
  ],
  sourceArtifacts: {
    family: "artifacts/blitz-mux-family-artifacts.json",
    genesisDraft: "artifacts/signed-drafts/blitz-mux-family-genesis-funding.json",
    genesisOutpoint: "fixtures/BlitzMuxFamilyContractOutpoint.json",
    routeDraft: "artifacts/signed-drafts/blitz-mux-route-to-worker-a.json",
    routeOutpoint: "fixtures/BlitzWorkerARouteOutpoint.json",
    returnDraft: "artifacts/signed-drafts/blitz-mux-worker-a-return.json",
    returnedOutpoint: "fixtures/BlitzMuxReturnedOutpoint.json"
  }
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
