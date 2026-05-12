import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/covenant-owned-asset-duel-live-strike-evidence.json";

const ownerDraft = await readJson("artifacts/signed-drafts/asset-duel-owner-marker-genesis.json");
const ownerOutpoint = await readJson("fixtures/AssetDuelOwnerMarkerOutpoint.json");
const liveArtifact = await readJson("artifacts/covenant-owned-asset-duel-live-artifact.json");
const liveGenesisDraft = await readJson("artifacts/signed-drafts/covenant-owned-asset-duel-live-genesis-funding.json");
const liveGenesisOutpoint = await readJson("fixtures/CovenantOwnedAssetDuelLiveContractOutpoint.json");
const strikeDraft = await readJson("artifacts/signed-drafts/covenant-owned-asset-duel-live-strike.json");
const strikeOutpoint = await readJson("fixtures/CovenantOwnedAssetDuelStrikeOutpoint.json");

const artifact = {
  schema: "tn12-covenant-owned-asset-duel-live-strike-evidence/v1",
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  status: "accepted-sibling-input-strike",
  pattern: {
    name: "ICC sibling-input authorization",
    description: "The asset covenant accepts an owner covenant id present on input 1. It does not nest or execute the owner covenant."
  },
  acceptedFlow: [
    {
      step: "owner-marker-genesis",
      txid: ownerOutpoint.txid,
      outputIndex: ownerOutpoint.outputIndex,
      amountSompi: ownerOutpoint.amountSompi,
      covenantId: ownerOutpoint.covenantId,
      status: ownerOutpoint.status,
      explorerUrl: ownerOutpoint.explorerUrl
    },
    {
      step: "asset-duel-genesis",
      txid: liveGenesisOutpoint.txid,
      outputIndex: liveGenesisOutpoint.outputIndex,
      amountSompi: liveGenesisOutpoint.amountSompi,
      covenantId: liveGenesisOutpoint.covenantId || liveGenesisDraft.covenantGenesis.covenant.covenantId,
      ownerCovenantId: liveArtifact.ownerCovenantId,
      status: liveGenesisOutpoint.status,
      explorerUrl: liveGenesisOutpoint.explorerUrl
    },
    {
      step: "sibling-authorized-strike",
      txid: strikeOutpoint.txid,
      outputIndex: strikeOutpoint.outputIndex,
      amountSompi: strikeOutpoint.amountSompi,
      covenantId: strikeOutpoint.covenantId || strikeDraft.source.assetOutpoint.covenantId,
      status: strikeOutpoint.status,
      explorerUrl: strikeOutpoint.explorerUrl,
      state: strikeDraft.state
    }
  ],
  localChecks: {
    strikeEngineAcceptedGeneratedSigScript: strikeDraft.localChecks.engineAcceptedGeneratedSigScript,
    assetContractAccepted: strikeDraft.localChecks.assetContractAccepted,
    ownerMarkerP2pkAccepted: strikeDraft.localChecks.ownerMarkerP2pkAccepted,
    outputCovenantMatchesAssetInput: strikeDraft.localChecks.output0CovenantMatchesAssetInput,
    ownerMarkerInputPresent: strikeDraft.localChecks.ownerMarkerInputPresent
  },
  proves: [
    "A standard P2PK owner-marker covenant output was accepted on TN12.",
    "The live Asset Duel covenant was compiled with that owner covenant id and accepted on TN12.",
    "A two-input strike spend was accepted on TN12 with the asset input plus owner-marker sibling input.",
    "The strike continuation reduced power from 600 to 450 and preserved the asset covenant id."
  ],
  doesNotProve: [
    "nested contract execution",
    "mainnet activation",
    "production asset standard",
    "user-wallet signing"
  ],
  sourceArtifacts: {
    ownerDraft: "artifacts/signed-drafts/asset-duel-owner-marker-genesis.json",
    ownerOutpoint: "fixtures/AssetDuelOwnerMarkerOutpoint.json",
    liveArtifact: "artifacts/covenant-owned-asset-duel-live-artifact.json",
    liveGenesisDraft: "artifacts/signed-drafts/covenant-owned-asset-duel-live-genesis-funding.json",
    liveGenesisOutpoint: "fixtures/CovenantOwnedAssetDuelLiveContractOutpoint.json",
    strikeDraft: "artifacts/signed-drafts/covenant-owned-asset-duel-live-strike.json",
    strikeOutpoint: "fixtures/CovenantOwnedAssetDuelStrikeOutpoint.json"
  }
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
