import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryRoleReview } from "../src/treasuryRoleReview.mjs";

const constrainedSpendsPath = process.env.TREASURY_CONSTRAINED_SPENDS || "artifacts/treasury-constrained-spends.json";
const outPath = process.env.OUT || "artifacts/treasury-role-review.json";

const constrainedSpends = JSON.parse(await readFile(constrainedSpendsPath, "utf8"));
const review = buildTreasuryRoleReview({ constrainedSpends });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(outPath);
console.log(`status=${review.status}`);
console.log(`roleSeparatedRows=${review.summary.roleSeparatedRows}`);
