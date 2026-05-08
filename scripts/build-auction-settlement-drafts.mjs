import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAuctionIntentPrototype } from "../src/auctionIntent.mjs";
import { buildAuctionSettlementDrafts } from "../src/auctionSettlementDrafts.mjs";

const fixturePath = process.env.AUCTION_FIXTURE || "fixtures/AuctionIntentPrototype.json";
const walletRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/auction-settlement-drafts.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const walletConnectorRequests = JSON.parse(await readFile(walletRequestsPath, "utf8"));
const auctionState = buildAuctionIntentPrototype(fixture);
const drafts = buildAuctionSettlementDrafts({ auctionState, walletConnectorRequests });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(drafts, null, 2)}\n`);

console.log(outPath);
console.log(`status=${drafts.status}`);
console.log(`drafts=${drafts.summary.drafts}`);
console.log(`custodyReadyDrafts=${drafts.summary.custodyReadyDrafts}`);
