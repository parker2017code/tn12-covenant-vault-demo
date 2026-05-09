import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAuctionCustodyReview } from "../src/auctionCustodyReview.mjs";

const settlementDraftsPath = process.env.AUCTION_SETTLEMENT_DRAFTS || "artifacts/auction-settlement-drafts.json";
const walletStandardMappingPath = process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json";
const outPath = process.env.OUT || "artifacts/auction-custody-review.json";

const settlementDrafts = JSON.parse(await readFile(settlementDraftsPath, "utf8"));
const walletStandardMapping = JSON.parse(await readFile(walletStandardMappingPath, "utf8"));
const review = buildAuctionCustodyReview({ settlementDrafts, walletStandardMapping });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(outPath);
console.log(`status=${review.status}`);
console.log(`custodyReadyRows=${review.summary.custodyReadyRows}`);
