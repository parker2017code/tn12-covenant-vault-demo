import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAccessPassIssuerReview } from "../src/accessPassIssuerReview.mjs";

const accessPassStatePath = process.env.ACCESS_PASS_STATE || "artifacts/access-pass-planner.json";
const outPath = process.env.OUT || "artifacts/access-pass-issuer-review.json";

const accessPassState = JSON.parse(await readFile(accessPassStatePath, "utf8"));
const review = buildAccessPassIssuerReview({ accessPassState });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(outPath);
console.log(`status=${review.status}`);
console.log(`issuerReviewRequired=${review.summary.issuerReviewRequired}`);
