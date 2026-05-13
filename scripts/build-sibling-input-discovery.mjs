import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildSiblingInputDiscovery } from "../src/siblingInputDiscovery.mjs";

const outPath = process.env.OUT || "artifacts/sibling-input-discovery.json";

const [strikeEvidence, strikeDraft, negativeEvidence, ownerOutpoint, assetOutpoint] = await Promise.all([
  readJson("artifacts/covenant-owned-asset-duel-live-strike-evidence.json"),
  readJson("artifacts/signed-drafts/covenant-owned-asset-duel-live-strike.json"),
  readJson("artifacts/covenant-owned-asset-duel-live-negative-evidence.json"),
  readJson("fixtures/AssetDuelOwnerMarkerOutpoint.json"),
  readJson("fixtures/CovenantOwnedAssetDuelLiveContractOutpoint.json")
]);

const artifact = buildSiblingInputDiscovery({
  strikeEvidence,
  strikeDraft,
  negativeEvidence,
  ownerOutpoint,
  assetOutpoint
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
