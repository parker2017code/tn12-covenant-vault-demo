import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFAULT_POLICY,
  buildLifecycle,
  buildPolicyArtifact,
  normalizePolicy,
  policyId,
  validatePolicy
} from "../src/vaultPolicy.mjs";

const policy = normalizePolicy({
  ...DEFAULT_POLICY,
  ownerAddress: "kaspatest:owner",
  recoveryAddress: "kaspatest:recovery",
  withdrawalDelayHours: "48",
  dailyLimitTkas: "250.5",
  guardianThreshold: "2",
  guardianCount: "3"
});

assert.equal(policy.withdrawalDelayHours, 48);
assert.equal(policy.dailyLimitTkas, 250.5);
assert.deepEqual(validatePolicy(policy), []);

const id = await policyId(policy);
assert.match(id, /^[a-f0-9]{24}$/);

const artifact = buildPolicyArtifact(policy, id);
assert.equal(artifact.network, "kaspa-testnet-12");
assert.equal(artifact.status, "local-simulation-not-broadcast");
assert.equal(buildLifecycle(policy).length, 5);

const files = [
  "index.html",
  "styles.css",
  "app.js",
  "package.json",
  "package-lock.json",
  "scripts/create-testnet-address.mjs",
  "README.md",
  "AGENTS.md",
  "docs/STATUS.md",
  "docs/SOURCES.md",
  "docs/ASSURANCE_CONTRACTS.md"
];

for (const file of files) {
  const text = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  assert.ok(text.length > 100, `${file} should not be empty`);
}

const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
assert.match(readme, /faucet-tn12\.kaspanet\.io/);
assert.match(readme, /not a mainnet wallet/i);
assert.match(readme, /npm run address/);

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert.match(html, /Local simulation\. No funds move\./);
assert.match(html, /TN12 faucet/);
assert.match(html, /npm run address/);

const assurance = await readFile(new URL("../docs/ASSURANCE_CONTRACTS.md", import.meta.url), "utf8");
assert.match(assurance, /funding rule strangers can rely on/);
assert.match(assurance, /AssurancePledge\.sil/);

console.log("Checks passed.");
