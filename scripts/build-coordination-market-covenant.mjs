import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildCoordinationMarketCovenant, buildCoordinationMarketSettlement } from "../src/coordinationMarketCovenant.mjs";

const outDir = "artifacts";
await mkdir(outDir, { recursive: true });

// Load fixtures for roles
const rolesFixture = JSON.parse(await readFile("fixtures/RoleSeparatedWallets.public.json", "utf8"));

// Build three game instances (stag-hunt, intendo, pack)
const games = [
  {
    gameType: "stag-hunt",
    participantA: rolesFixture.roles.pledgeContributor,
    participantB: rolesFixture.roles.pledgeRecipient,
    stake: 50000000n
  },
  {
    gameType: "intendo",
    participantA: rolesFixture.roles.vaultOwner,
    participantB: rolesFixture.roles.vaultRecovery,
    stake: 40000000n
  },
  {
    gameType: "pack",
    participantA: rolesFixture.roles.escrowBuyer,
    participantB: rolesFixture.roles.escrowSeller,
    stake: 60000000n
  }
];

const covenants = [];

for (const gameConfig of games) {
  const covenant = buildCoordinationMarketCovenant({
    gameId: `tn12-${gameConfig.gameType}-${Date.now()}`,
    participantAKey: Buffer.from(gameConfig.participantA.xOnlyPublicKey, "hex"),
    participantBKey: Buffer.from(gameConfig.participantB.xOnlyPublicKey, "hex"),
    stakePerPlayerSompi: gameConfig.stake,
    gameType: gameConfig.gameType
  });

  // Simulate potential settlements
  const outcomes = covenant.gameRules.moves.A.length * covenant.gameRules.moves.B.length;

  covenants.push({
    gameId: covenant.gameId,
    gameType: covenant.gameType,
    status: "ready-for-move-commitment",
    roles: 2,
    possibleOutcomes: outcomes,
    stakePerPlayerSompi: String(gameConfig.stake)
  });
}

const artifact = {
  schema: "tn12-coordination-market-covenant-artifact/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: "coordination-market-covenant-stubs-ready",
  summary: {
    contractType: "CoordinationGame",
    gameTypesSupported: 3,
    gamesConfigured: covenants.length,
    settlementModel: "escrow-multi-party"
  },
  games: covenants,
  note: "Stub implementations for stag-hunt, intendo, pack games; ready for move commitment and settlement testing"
};

await writeFile(`${outDir}/coordination-market-covenant-stubs.json`, JSON.stringify(artifact, null, 2));
console.log("✓ Coordination market covenant stubs:", `${outDir}/coordination-market-covenant-stubs.json`);
console.log(`  Status: ${artifact.status}`);
console.log(`  Games configured: ${covenants.length}`);
console.log(`  Game types: ${covenants.map((g) => g.gameType).join(", ")}`);
