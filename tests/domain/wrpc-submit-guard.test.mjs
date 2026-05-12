import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile("scripts/submit-signed-draft-wrpc.mjs", "utf8");

assert.match(source, /assertSubmitAllowed\(artifact\)/);
assert.match(source, /status\.startsWith\("blocked-"\)/);
assert.match(source, /engineAcceptedGeneratedSigScript === false/);
assert.match(source, /--allow-blocked-local-engine/);

console.log("wRPC submit guard tests passed.");
