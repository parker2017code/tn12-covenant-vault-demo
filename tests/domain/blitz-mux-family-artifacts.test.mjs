import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/blitz-mux-family-artifacts.json", "utf8"));
const mux = JSON.parse(await readFile("artifacts/BlitzMuxFamily.json", "utf8"));
const workerA = JSON.parse(await readFile("artifacts/BlitzWorkerAFamily.json", "utf8"));
const workerB = JSON.parse(await readFile("artifacts/BlitzWorkerBFamily.json", "utf8"));

assert.equal(artifact.schema, "tn12-blitz-mux-family-artifacts/v1");
assert.equal(artifact.status, "family-template-artifacts-built");
assert.match(artifact.templates.mux, /^[0-9a-f]{64}$/);
assert.match(artifact.templates.a, /^[0-9a-f]{64}$/);
assert.match(artifact.templates.b, /^[0-9a-f]{64}$/);
assert.equal(mux.contract_name, "BlitzMux");
assert.equal(workerA.contract_name, "BlitzWorkerA");
assert.equal(workerB.contract_name, "BlitzWorkerB");
assert.ok(mux.script.length > 0);
assert.ok(workerA.script.length > 0);
assert.ok(workerB.script.length > 0);

console.log("Blitz mux family artifact tests passed.");
