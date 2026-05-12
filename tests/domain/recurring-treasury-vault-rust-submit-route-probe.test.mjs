import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/recurring-treasury-vault-rust-submit-route-probe.json", "utf8"));

assert.equal(artifact.schema, "tn12-recurring-treasury-vault-rust-submit-route-probe/v1");
assert.equal(artifact.status, "rust-submit-route-preserves-covenant-binding");
assert.equal(artifact.fields.rust_submit_route_preserves_output_covenant, "true");
assert.equal(artifact.fields.input_compute_budget, "30");
assert.equal(artifact.fields.output_covenant_authorizing_input, "0");
assert.match(artifact.fields.output_covenant_id, /^[0-9a-f]{64}$/);
assert.ok(artifact.doesNotProve.includes("network broadcast"));
assert.ok(artifact.doesNotProve.includes("accepted TN12 recurring-vault spend"));

console.log("Recurring treasury vault Rust submit route probe tests passed.");
