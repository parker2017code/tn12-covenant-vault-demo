import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const artifact = JSON.parse(await readFile("artifacts/silverscript-build-depth-review.json", "utf8"));

assert.equal(artifact.schema, "tn12-silverscript-build-depth-review/v1");
assert.equal(artifact.status, "stateful-covenant-depth-in-progress");
assert.equal(artifact.target.contract, "contracts/RecurringTreasuryVault.sil");
assert.equal(artifact.currentEvidence.compiled, true);
assert.ok(artifact.currentEvidence.compiledBytes > 1000);
assert.match(artifact.currentEvidence.acceptedFunding.txid, /^[0-9a-f]{64}$/);
assert.ok(artifact.localSourceFindings.some((item) => item.id === "js-wasm-output-binding-gap" && item.status === "blocks-js-live-submit"));
assert.ok(artifact.localSourceFindings.some((item) => item.id === "rust-debugger-can-model-covenant-bindings"));
assert.ok(artifact.buildRulesForAgents.some((rule) => /Do not call the recurring cap SCRIPT_ENFORCED/.test(rule)));
assert.ok(artifact.nextSteps.some((step) => /typed correctly/.test(step.task)));

console.log("SilverScript build-depth review tests passed.");
