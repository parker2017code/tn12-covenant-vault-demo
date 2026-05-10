import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAuctionSettlementCovenant, buildAuctionSettlementValidation } from "../src/auctionSettlementCovenant.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures for roles
const rolesFixture = JSON.parse(await readFile("fixtures/RoleSeparatedWallets.public.json", "utf8"));

// Build auction settlement covenant with test roles
const covenant = buildAuctionSettlementCovenant({
  auctionId: "tn12-auction-001",
  sellerKey: Buffer.from(rolesFixture.roles.escrowSeller.xOnlyPublicKey, "hex"),
  highestBidderKey: Buffer.from(rolesFixture.roles.escrowBuyer.xOnlyPublicKey, "hex"),
  reservePriceSompi: 50000000n,
  bidAmountSompi: 75000000n,
  endBlockDaa: 8055346
});

// Validate
const validation = buildAuctionSettlementValidation({
  covenant,
  submittedBidAmount: 75000000n,
  currentBlockDaa: 8055346
});

const artifact = {
  schema: "tn12-auction-settlement-covenant-artifact/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "auction-settlement-covenant-stub-ready",
  summary: {
    contractType: "AuctionSettlement",
    roles: 2,
    settlementOutcomes: 1,
    validated: validation.valid
  },
  covenant,
  validation,
  note: "Stub implementation using escrow pattern; ready for TN12 covenant build"
};

await writeFile(`${outDir}/auction-settlement-covenant-stub.json`, JSON.stringify(artifact, null, 2));
console.log("✓ Auction settlement covenant stub:", `${outDir}/auction-settlement-covenant-stub.json`);
console.log(`  Status: ${artifact.status}`);
console.log(`  Roles separated: ${validation.rolesSeparated}`);
console.log(`  Reserve met: ${validation.reservePriceMet}`);
console.log(`  Outputs locked: ${validation.outputsLocked}`);
