import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/blitz-mux-challenge-settlement.json", "utf8"));

assert.equal(artifact.schema, "tn12-blitz-mux-challenge-settlement/v1");
assert.equal(artifact.status, "accepted-timeout-settlement-with-local-challenges");
assert.equal(artifact.rows.length, 5);
assert.ok(artifact.rows.some((row) => row.id === "normal-worker-settlement" && row.status === "accepted-on-tn12"));
assert.ok(artifact.rows.some((row) => row.id === "timeout-settlement" && row.evidence === "26be92cbbde3673e2ba539412b981655693ed3f4a08c8ad9f7ce3b2e47aef036"));
assert.ok(artifact.rows.some((row) => row.id === "worker-b-settlement" && row.evidence === "9985e4e92d5e877b1530ae00625be29429350bb6393c9da1ee5a9d92c9fa9eb2"));
assert.ok(artifact.rows.some((row) => row.id === "bad-selector-challenge" && /got=false/.test(row.result)));
assert.ok(artifact.rows.some((row) => row.id === "too-early-timeout-challenge" && /got=false/.test(row.result)));
assert.ok(/Fast UTXO/.test(artifact.kaspaEdge));
assert.ok(/private game server/.test(artifact.cryptoPoint));
assert.ok(artifact.doesNotProve.includes("full chess or full game rules"));

console.log("Blitz mux challenge settlement tests passed.");
