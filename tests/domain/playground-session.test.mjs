import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildPlaygroundSession } from "../../src/playgroundSession.mjs";

const plan = await readJson("artifacts/playground-plan.json");
const session = buildPlaygroundSession({
  plan,
  publicAddresses: {
    operator: "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt",
    pool: "kaspatest:qqpgfuzxvt7vtud4qv5aklpe5z0kd27j4pw33x33t3ya3ya95ffrymd0gntt4"
  },
  txids: [
    {
      label: "sample accepted receipt",
      txid: "dcd580d40d7a493947bb8c5acf709a3091cb751763c55fde9059e1dcebeb5f97",
      accepted: true,
      enforcement: "TN12_ACCEPTED"
    }
  ],
  generatedAt: "2026-05-11T00:00:00.000Z"
});

assert.equal(session.schema, "tn12-playground-session/v1");
assert.equal(session.status, "playground-session-public-state-ready");
assert.equal(session.summary.roles, 6);
assert.equal(session.summary.fundedRoles, 2);
assert.equal(session.summary.acceptedTxids, 1);
assert.equal(session.summary.privateKeysIncluded, 0);
assert.equal(session.summary.committedSecrets, 0);
assert.ok(session.roles.every((role) => role.privateKeyIncluded === false));
assert.doesNotMatch(JSON.stringify(Object.values(session).flat()), /\.local\/|xprv|mnemonic phrase/i);

const checkedIn = await readJson("artifacts/playground-session.example.json");
assert.equal(checkedIn.schema, "tn12-playground-session/v1");
assert.equal(checkedIn.summary.privateKeysIncluded, 0);

console.log("Playground session tests passed.");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
