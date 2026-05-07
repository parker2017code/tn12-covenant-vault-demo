import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAuctionIntentPrototype } from "../src/auctionIntent.mjs";

const fixturePath = process.env.AUCTION_INTENT_FIXTURE || "fixtures/AuctionIntentPrototype.json";
const outPath = process.env.OUT || "artifacts/auction-intents.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const prototype = buildAuctionIntentPrototype(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(prototype, null, 2)}\n`);
console.log(outPath);
console.log(`auctions=${prototype.summary.auctions}`);
console.log(`acceptedBidPayloads=${prototype.summary.acceptedBidPayloads}`);
