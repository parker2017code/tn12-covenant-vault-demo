import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/covenant-heist-evidence.json", "utf8"));

assert.equal(artifact.schema, "tn12-covenant-heist-evidence/v1");
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "accepted-vault-rail-with-local-heist-rejects");
assert.equal(artifact.acceptedBackbone.cumulativeSpendTxids.length, 2);
assert.equal(artifact.acceptedBackbone.resetTxid, "f99bb6f6552beac976b770448ef2d75748b4d7fbf66932e1156ea41493978759");
assert.equal(artifact.rows.length, 7);
assert.ok(artifact.rows.every((row) => row.status === "blocked-local-engine-failed"));
assert.ok(artifact.rows.some((row) => row.id === "wrong-owner-signature"));
assert.ok(artifact.rows.some((row) => row.id === "wrong-destination"));
assert.ok(artifact.rows.some((row) => row.id === "missing-continuation"));
assert.ok(artifact.rows.some((row) => row.id === "cumulative-over-cap"));
assert.ok(artifact.rows.some((row) => row.id === "early-reset"));
assert.ok(artifact.rows.some((row) => row.id === "stale-reset-window"));
assert.ok(artifact.rows.some((row) => row.id === "over-cap-reset"));
assert.ok(/normal server/.test(artifact.cryptoPoint));
assert.ok(/Fast TN12/.test(artifact.kaspaEdge));
assert.ok(artifact.doesNotProve.includes("TN12 broadcast-rejected invalid candidates"));

console.log("Covenant Heist evidence tests passed.");
