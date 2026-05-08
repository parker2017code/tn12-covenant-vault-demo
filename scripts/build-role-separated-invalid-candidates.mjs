import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildRoleSeparatedInvalidCandidates } from "../src/roleSeparatedInvalidCandidates.mjs";

const outPath = process.env.OUT || "artifacts/role-separated-invalid-candidates.json";

const draftPaths = [
  "artifacts/signed-drafts/role-vault-recovery.json",
  "artifacts/signed-drafts/role-daa-expired-vault-withdrawal.json",
  "artifacts/signed-drafts/role-assurance-release.json",
  "artifacts/signed-drafts/role-daa-expired-assurance-refund.json",
  "artifacts/signed-drafts/role-escrow-release.json",
  "artifacts/signed-drafts/role-daa-expired-escrow-refund.json",
  "artifacts/signed-drafts/role-expired-escrow-cancel.json"
];

const proofFixture = await readJson("fixtures/RoleSeparatedAcceptedProofTransactions.json");
const roleWallets = await readJson("fixtures/RoleSeparatedWallets.public.json");
const drafts = Object.fromEntries(await Promise.all(draftPaths.map(async (path) => [
  path,
  await readJson(path)
])));

const invalidCandidates = buildRoleSeparatedInvalidCandidates({
  proofFixture,
  drafts,
  roleWallets
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(invalidCandidates, null, 2)}\n`);

console.log(outPath);
console.log(`status=${invalidCandidates.status}`);
console.log(`proofPaths=${invalidCandidates.summary.proofPaths}`);
console.log(`candidates=${invalidCandidates.summary.candidates}`);
console.log(`readyForSubmission=${invalidCandidates.summary.readyForSubmission}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
