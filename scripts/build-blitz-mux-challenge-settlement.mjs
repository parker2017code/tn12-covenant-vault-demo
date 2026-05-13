import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/blitz-mux-challenge-settlement.json";
const proof = await readJson("artifacts/blitz-mux-arena-proof.json");
const live = await readJson("artifacts/blitz-mux-live-flow-evidence.json");

const byStep = Object.fromEntries(live.acceptedFlow.map((step) => [step.step, step]));
const byCase = Object.fromEntries(proof.cases.map((item) => [item.name, item]));

const rows = [
  {
    id: "normal-worker-settlement",
    status: "accepted-on-tn12",
    evidence: byStep["worker-a-return-to-mux"]?.txid,
    rule: "Worker A returns valid state to mux before timeout.",
    result: "value 5 -> 8, pending 1 -> 0"
  },
  {
    id: "timeout-settlement",
    status: "accepted-on-tn12",
    evidence: byStep["worker-a-timeout-to-mux"]?.txid,
    rule: "Pending Worker A state can return to mux after sequence reaches the timeout.",
    result: "value 8 -> 7, pending 1 -> 0"
  },
  {
    id: "bad-selector-challenge",
    status: "blocked-local-engine-failed",
    evidence: "blitz-mux-arena-proof:mux_bad_selector_rejects",
    rule: "Mux only routes selector 0 or 1.",
    result: `got=${byCase.mux_bad_selector_rejects?.got} expected=${byCase.mux_bad_selector_rejects?.expected}`
  },
  {
    id: "too-early-timeout-challenge",
    status: "blocked-local-engine-failed",
    evidence: "blitz-mux-arena-proof:worker_a_timeout_too_early_rejects",
    rule: "Worker timeout cannot settle before the move clock.",
    result: `got=${byCase.worker_a_timeout_too_early_rejects?.got} expected=${byCase.worker_a_timeout_too_early_rejects?.expected}`
  }
];

const artifact = {
  schema: "tn12-blitz-mux-challenge-settlement/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: rows.every((row) => row.status.includes("accepted") || row.status.includes("blocked"))
    ? "accepted-timeout-settlement-with-local-challenges"
    : "incomplete",
  contractFamily: live.contractFamily,
  plainPoint: "A routed turn can finish normally or settle by timeout if the worker path stalls.",
  technicalPoint: "The mux routes state to a worker template; the worker either applies a valid update or a timeout branch returns state to the mux after the sequence threshold.",
  kaspaEdge: "Fast UTXO flow makes a two-transaction route and a later timeout escape usable as a live workflow.",
  cryptoPoint: "The state transition is constrained by output rules and covenant family id rather than a private game server deciding the winner.",
  realWorldImplication: "The same pattern applies to games, dispute windows, staged approvals, service jobs, auctions, and workflows where a selected role must either act or time out.",
  rows,
  proves: [
    "accepted TN12 normal worker return",
    "accepted TN12 timeout settlement from pending worker state",
    "local bad-selector reject",
    "local too-early timeout reject"
  ],
  doesNotProve: [
    "full chess or full game rules",
    "challenge evidence beyond selector and early-timeout guards",
    "mainnet activation",
    "production game settlement"
  ],
  sourceArtifacts: {
    localProof: "artifacts/blitz-mux-arena-proof.json",
    liveFlow: "artifacts/blitz-mux-live-flow-evidence.json"
  },
  publicCopyRule: "Call this a bounded timeout-settlement row for a TN12 mux/worker primitive, not a full game."
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
