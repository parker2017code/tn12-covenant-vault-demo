import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/covenant-heist-evidence.json";

const ownerSig = await readJson("artifacts/recurring-treasury-vault-owner-sig-proof.json");
const cumulative = await readJson("artifacts/recurring-treasury-vault-cumulative-cap-proof.json");
const reset = await readJson("artifacts/recurring-treasury-vault-window-reset-proof.json");
const negativeMap = await readJson("artifacts/recurring-treasury-vault-negative-map.json");

const ownerCases = Object.fromEntries(ownerSig.cases.map((item) => [item.name, item]));
const resetCases = Object.fromEntries(reset.negativeCases.map((item) => [item.id, item]));
const candidateRows = Object.fromEntries(negativeMap.rows.map((item) => [item.id, item]));

const rows = [
  {
    id: "wrong-owner-signature",
    status: localBlocked(ownerCases.over_cap_owner_sig_fails) ? "blocked-local-engine-failed" : "needs-review",
    class: "SCRIPT_ENFORCED_LOCAL",
    rule: candidateRows["wrong-owner-signature"]?.expectedFailure || "checkSig(ownerSig, owner)",
    evidence: "artifacts/recurring-treasury-vault-owner-sig-proof.json:over_cap_owner_sig_fails",
    attack: "Spend with a signature that is not from the owner role.",
    point: "The vault rule starts with authority, not just amount math."
  },
  {
    id: "wrong-destination",
    status: localBlocked(ownerCases.wrong_destination_owner_sig_fails) ? "blocked-local-engine-failed" : "needs-review",
    class: "SCRIPT_ENFORCED_LOCAL",
    rule: candidateRows["wrong-destination"]?.expectedFailure || "destination output must match",
    evidence: "artifacts/recurring-treasury-vault-owner-sig-proof.json:wrong_destination_owner_sig_fails",
    attack: "Keep the amount under cap but send it to the wrong destination.",
    point: "A cap alone is not enough; the destination also has to be constrained."
  },
  {
    id: "missing-continuation",
    status: localBlocked(ownerCases.missing_continuation_owner_sig_fails) ? "blocked-local-engine-failed" : "needs-review",
    class: "SCRIPT_ENFORCED_LOCAL",
    rule: candidateRows["missing-continuation"]?.expectedFailure || "validateOutputState(1, newState)",
    evidence: "artifacts/recurring-treasury-vault-owner-sig-proof.json:missing_continuation_owner_sig_fails",
    attack: "Take the spend output but do not relock the vault continuation.",
    point: "The state machine survives only if the next output carries the rules forward."
  },
  {
    id: "cumulative-over-cap",
    status: cumulative.blockedCandidate?.status || "needs-review",
    class: "SCRIPT_ENFORCED_LOCAL",
    rule: "prevState.spent + amount <= cap",
    evidence: cumulative.blockedCandidate?.artifact,
    attack: "Make a third spend that pushes the window from 65 tKAS to 80 tKAS against a 75 tKAS cap.",
    point: "The cap is cumulative across continuation state, not just a per-transaction ceiling."
  },
  ...reset.negativeCases.map((item) => ({
    id: item.id,
    status: item.status,
    class: "SCRIPT_ENFORCED_LOCAL",
    rule: item.reason,
    evidence: item.artifact,
    attack: resetAttack(item.id),
    point: resetPoint(item.id)
  }))
];

const artifact = {
  schema: "tn12-covenant-heist-evidence/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: rows.every((row) => row.status === "blocked-local-engine-failed")
    ? "accepted-vault-rail-with-local-heist-rejects"
    : "heist-evidence-needs-review",
  plainPoint: "The useful vault story is not only that good spends work. It is that obvious theft paths fail.",
  technicalPoint: "Accepted TN12 recurring-vault spends establish the live rail; local SilverScript and full owner-signature harnesses reject wrong authority, wrong output shape, missing continuation, cap overflow, and bad reset windows.",
  kaspaEdge: "Fast TN12 feedback makes attack/defense review practical: a reviewer can inspect accepted spends and local refusal evidence as one short loop.",
  cryptoPoint: "A normal server can say no to a withdrawal, but this demo shows the spend rule itself refusing invalid transaction shapes before money moves.",
  realWorldImplication: "Family vaults, team treasuries, game banks, escrow systems, and allowance wallets need explainable refusal paths, not only successful happy paths.",
  acceptedBackbone: {
    cumulativeSpendTxids: cumulative.acceptedSpends.map((item) => item.txid),
    resetTxid: reset.accepted.resetTxid,
    resetGenesisTxid: reset.accepted.genesisTxid
  },
  rows,
  proves: [
    "accepted TN12 recurring-vault spends exist for the good path",
    "accepted TN12 reset-window spend exists for the good reset path",
    "wrong owner, wrong destination, missing continuation, cumulative over-cap, early reset, stale reset, and over-cap reset fail local script-engine checks"
  ],
  doesNotProve: [
    "TN12 broadcast-rejected invalid candidates",
    "mainnet activation",
    "wallet-standard user signing",
    "audited custody",
    "production fraud monitoring"
  ],
  sourceArtifacts: {
    ownerSig: "artifacts/recurring-treasury-vault-owner-sig-proof.json",
    cumulative: "artifacts/recurring-treasury-vault-cumulative-cap-proof.json",
    reset: "artifacts/recurring-treasury-vault-window-reset-proof.json",
    negativeMap: "artifacts/recurring-treasury-vault-negative-map.json"
  },
  publicCopyRule: "Call this an adversarial TN12/testnet evidence view over the recurring-vault rail. Do not call the invalid rows node-rejected unless they were safely submitted and rejected."
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

function localBlocked(testCase) {
  return testCase?.got === false && testCase?.expected === false && testCase?.status === "passed";
}

function resetAttack(id) {
  if (id === "early-reset") return "Reset the window before the required lock time.";
  if (id === "stale-reset-window") return "Claim reset but keep the old window state.";
  if (id === "over-cap-reset") return "Reset and immediately spend more than the cap.";
  return "Mutate the reset path.";
}

function resetPoint(id) {
  if (id === "early-reset") return "Time rules matter; a reset cannot be pulled forward by the UI.";
  if (id === "stale-reset-window") return "The continuation state has to advance, not merely look like a reset.";
  if (id === "over-cap-reset") return "A new window does not remove the cap.";
  return "Reset paths need the same negative discipline as spend paths.";
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
