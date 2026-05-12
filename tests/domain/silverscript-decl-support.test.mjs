import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const support = JSON.parse(await readFile("artifacts/silverscript-decl-support.json", "utf8"));

assert.equal(support.schema, "tn12-silverscript-decl-support/v1");
assert.equal(support.status, "decl-covenant-probe-compiled");
assert.equal(support.source, "contracts/probes/RecurringTreasuryDeclProbe.sil");
assert.equal(support.supportedSignals.covenantMacro, true);
assert.equal(support.supportedSignals.covBinding, true);
assert.equal(support.supportedSignals.stateArrayParameters, true);
assert.equal(support.supportedSignals.opCovLowering, true);
assert.ok(support.compiledBytes > 1000);
assert.match(support.nextRail, /RecurringTreasuryVault\.sil/);

console.log("SilverScript DECL support tests passed.");
