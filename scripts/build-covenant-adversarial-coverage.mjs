import { readFile, writeFile } from "node:fs/promises";
import { buildCovenantAdversarialCoverage } from "../src/covenantAdversarialCoverage.mjs";

const outPath = process.env.OUT || "artifacts/covenant-adversarial-coverage.json";

const proofFixture = await readJson("fixtures/AcceptedProofTransactions.json");
const coverage = buildCovenantAdversarialCoverage({
  proofFixture,
  constructorArgs: {
    DelayedRecoveryVault: await readJson("fixtures/DelayedRecoveryVault.ctor.json"),
    AssurancePledge: await readJson("fixtures/AssurancePledge.ctor.json"),
    Escrow: await readJson("fixtures/Escrow.ctor.json")
  },
  compiledContracts: {
    DelayedRecoveryVault: await readJson("artifacts/DelayedRecoveryVault.json"),
    AssurancePledge: await readJson("artifacts/AssurancePledge.json"),
    Escrow: await readJson("artifacts/Escrow.json")
  },
  drafts: [
    await draft("artifacts/signed-drafts/vault-recovery.json", "b76cc933b97a0bdb901ffae27a517a52577c27297c70be343dc6cab734ba1391"),
    await draft("artifacts/signed-drafts/vault-withdrawal.json", "9bc524406f3d311d16e5c8c115a9d8f044ab83659a24c744b152a90f8b3aa710"),
    await draft("artifacts/signed-drafts/assurance-release.json", "80be77c594bf73dc9a4cb5d3c65152095df6cdfc869e95ea7b94d96262e3fd2f"),
    await draft("artifacts/signed-drafts/assurance-refund.json", "faacfee4c4e790e4f36870f78cdb0d151b5a8c5c9356bf55269a78631c4c4d61"),
    await draft("artifacts/signed-drafts/escrow-release.json", "825a9b9f7194d7741136b4be9817d052c9055893e007ef027b92b03d6e425c5d"),
    await draft("artifacts/signed-drafts/escrow-daa-refund-proof-refund.json", "6731423fa5b600a7ac14ef83aa13a3acc810fdec29f91c02262b67c88eec5f4d"),
    await draft("artifacts/signed-drafts/escrow-cancel-proof-cancel.json", "14d43df2ef63dbc42c8b9ee8362894cb16225f8001234a67b63b127c0e8d289c")
  ]
});

await writeFile(outPath, `${JSON.stringify(coverage, null, 2)}\n`);
console.log(outPath);
console.log(`status=${coverage.status}`);
console.log(`cases=${coverage.summary.localDraftCases}`);
console.log(`mutations=${coverage.summary.adversarialMutations}`);
console.log(`openGaps=${coverage.summary.openGaps}`);

async function draft(path, acceptedTxid) {
  return {
    path,
    acceptedTxid,
    draft: await readJson(path)
  };
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
