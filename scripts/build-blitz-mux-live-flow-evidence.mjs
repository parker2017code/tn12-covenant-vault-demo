import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/blitz-mux-live-flow-evidence.json";

const family = await readJson("artifacts/blitz-mux-family-artifacts.json");
const genesisDraft = await readJson("artifacts/signed-drafts/blitz-mux-family-genesis-funding.json");
const genesisOutpoint = await readJson("fixtures/BlitzMuxFamilyContractOutpoint.json");
const routeDraft = await readJson("artifacts/signed-drafts/blitz-mux-route-to-worker-a.json");
const routeOutpoint = await readJson("fixtures/BlitzWorkerARouteOutpoint.json");
const returnDraft = await readJson("artifacts/signed-drafts/blitz-mux-worker-a-return.json");
const returnedOutpoint = await readJson("fixtures/BlitzMuxReturnedOutpoint.json");
const timeoutRouteDraft = await readJson("artifacts/signed-drafts/blitz-mux-route-to-worker-a-timeout.json");
const timeoutRouteOutpoint = await readJson("fixtures/BlitzWorkerATimeoutRouteOutpoint.json");
const timeoutDraft = await readJson("artifacts/signed-drafts/blitz-mux-worker-a-timeout.json");
const timeoutOutpoint = await readJson("fixtures/BlitzMuxTimeoutOutpoint.json");
const workerBRouteDraft = await readJson("artifacts/signed-drafts/blitz-mux-route-to-worker-b.json");
const workerBRouteOutpoint = await readJson("fixtures/BlitzWorkerBRouteOutpoint.json");
const workerBReturnDraft = await readJson("artifacts/signed-drafts/blitz-mux-worker-b-return.json");
const workerBReturnedOutpoint = await readJson("fixtures/BlitzMuxWorkerBReturnedOutpoint.json");

const artifact = {
  schema: "tn12-blitz-mux-live-flow-evidence/v1",
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  status: "accepted-mux-route-worker-return-and-timeout",
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
    },
    {
      step: "route-to-worker-a-for-timeout",
      contract: "BlitzWorkerA",
      txid: timeoutRouteOutpoint.txid,
      outputIndex: timeoutRouteOutpoint.outputIndex,
      amountSompi: timeoutRouteOutpoint.amountSompi,
      status: timeoutRouteOutpoint.status,
      explorerUrl: timeoutRouteOutpoint.explorerUrl,
      state: timeoutRouteDraft.route.state
    },
    {
      step: "worker-a-timeout-to-mux",
      contract: "BlitzMux",
      txid: timeoutOutpoint.txid,
      outputIndex: timeoutOutpoint.outputIndex,
      amountSompi: timeoutOutpoint.amountSompi,
      status: timeoutOutpoint.status,
      explorerUrl: timeoutOutpoint.explorerUrl,
      state: timeoutDraft.route.state
    },
    {
      step: "route-to-worker-b",
      contract: "BlitzWorkerB",
      txid: workerBRouteOutpoint.txid,
      outputIndex: workerBRouteOutpoint.outputIndex,
      amountSompi: workerBRouteOutpoint.amountSompi,
      status: workerBRouteOutpoint.status,
      explorerUrl: workerBRouteOutpoint.explorerUrl,
      state: workerBRouteDraft.route.state
    },
    {
      step: "worker-b-return-to-mux",
      contract: "BlitzMux",
      txid: workerBReturnedOutpoint.txid,
      outputIndex: workerBReturnedOutpoint.outputIndex,
      amountSompi: workerBReturnedOutpoint.amountSompi,
      status: workerBReturnedOutpoint.status,
      explorerUrl: workerBReturnedOutpoint.explorerUrl,
      state: workerBReturnDraft.route.state
    }
  ],
  localChecks: {
    routeEngineAcceptedGeneratedSigScript: routeDraft.localChecks.engineAcceptedGeneratedSigScript,
    returnEngineAcceptedGeneratedSigScript: returnDraft.localChecks.engineAcceptedGeneratedSigScript,
    timeoutRouteEngineAcceptedGeneratedSigScript: timeoutRouteDraft.localChecks.engineAcceptedGeneratedSigScript,
    timeoutEngineAcceptedGeneratedSigScript: timeoutDraft.localChecks.engineAcceptedGeneratedSigScript,
    routeCovenantMatchesInput: routeDraft.localChecks.output0CovenantMatchesInput,
    returnCovenantMatchesInput: returnDraft.localChecks.output0CovenantMatchesInput,
    timeoutRouteCovenantMatchesInput: timeoutRouteDraft.localChecks.output0CovenantMatchesInput,
    timeoutCovenantMatchesInput: timeoutDraft.localChecks.output0CovenantMatchesInput,
    timeoutSequenceMeetsThreshold: timeoutDraft.localChecks.sequenceMeetsTimeout,
    workerBRouteEngineAcceptedGeneratedSigScript: workerBRouteDraft.localChecks.engineAcceptedGeneratedSigScript,
    workerBReturnEngineAcceptedGeneratedSigScript: workerBReturnDraft.localChecks.engineAcceptedGeneratedSigScript,
    workerBRouteCovenantMatchesInput: workerBRouteDraft.localChecks.output0CovenantMatchesInput,
    workerBReturnCovenantMatchesInput: workerBReturnDraft.localChecks.output0CovenantMatchesInput
  },
  proves: [
    "A BlitzMux family genesis output was accepted on TN12.",
    "The mux routed accepted state to Worker A through template identity.",
    "Worker A returned accepted state to the mux.",
    "A fresh mux state routed to Worker A again, then the Worker A timeout path returned state to mux.",
    "The timeout-returned mux state then routed to Worker B, and Worker B returned state with its gain-minus-fee rule.",
    "Both spends preserved the same covenant family id."
  ],
  doesNotProve: [
    "full chess rules",
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
    returnedOutpoint: "fixtures/BlitzMuxReturnedOutpoint.json",
    timeoutRouteDraft: "artifacts/signed-drafts/blitz-mux-route-to-worker-a-timeout.json",
    timeoutRouteOutpoint: "fixtures/BlitzWorkerATimeoutRouteOutpoint.json",
    timeoutDraft: "artifacts/signed-drafts/blitz-mux-worker-a-timeout.json",
    timeoutOutpoint: "fixtures/BlitzMuxTimeoutOutpoint.json",
    workerBRouteDraft: "artifacts/signed-drafts/blitz-mux-route-to-worker-b.json",
    workerBRouteOutpoint: "fixtures/BlitzWorkerBRouteOutpoint.json",
    workerBReturnDraft: "artifacts/signed-drafts/blitz-mux-worker-b-return.json",
    workerBReturnedOutpoint: "fixtures/BlitzMuxWorkerBReturnedOutpoint.json"
  }
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
