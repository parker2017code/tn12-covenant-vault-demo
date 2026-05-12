import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/blitz-mux-arena-proof.json", "utf8"));

assert.equal(artifact.schema, "tn12-blitz-mux-arena-proof/v1");
assert.equal(artifact.status, "local-mux-worker-timeout-proof-passed");
assert.deepEqual(artifact.sources, ["contracts/BlitzMux.sil", "contracts/BlitzWorkerA.sil", "contracts/BlitzWorkerB.sil"]);
assert.equal(artifact.pattern, "mux/worker routing with timeout escape");
assert.equal(artifact.cases.length, 7);
assert.ok(artifact.cases.every((item) => item.status === "passed"));
assert.ok(artifact.cases.some((item) => item.name === "mux_routes_to_worker_a" && item.got === true));
assert.ok(artifact.cases.some((item) => item.name === "worker_b_returns_to_mux" && item.got === true));
assert.ok(artifact.cases.some((item) => item.name === "mux_bad_selector_rejects" && item.got === false));
assert.ok(artifact.cases.some((item) => item.name === "worker_a_timeout_returns_to_mux" && item.got === true));
assert.ok(artifact.cases.some((item) => item.name === "worker_a_timeout_too_early_rejects" && item.got === false));
assert.ok(artifact.doesNotProve.includes("accepted TN12 broadcast"));

console.log("Blitz mux arena proof tests passed.");
