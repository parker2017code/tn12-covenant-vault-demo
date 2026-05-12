import { readFile, writeFile } from "node:fs/promises";
import { buildRecurringTreasuryVaultLiveSpendPreflight } from "../src/recurringTreasuryVaultLiveSpendPreflight.mjs";

const contractOutpoint = await readJson("fixtures/RecurringTreasuryVaultContractOutpoint.json");
const liveUtxos = await fetchLiveUtxos(contractOutpoint.scriptPublicKeyAddress);

const artifact = buildRecurringTreasuryVaultLiveSpendPreflight({
  compiledArtifact: await readJson("artifacts/RecurringTreasuryVault.json"),
  constructorArgs: await readJson("fixtures/RecurringTreasuryVault.ctor.json"),
  contractOutpoint,
  ownerSigProof: await readJson("artifacts/recurring-treasury-vault-owner-sig-proof.json"),
  rustSubmitRouteProbe: await readJson("artifacts/recurring-treasury-vault-rust-submit-route-probe.json"),
  liveUtxos
});

await writeFile("artifacts/recurring-treasury-vault-live-spend-preflight.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`artifacts/recurring-treasury-vault-live-spend-preflight.json ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchLiveUtxos(address) {
  const response = await fetch(`https://api-tn12.kaspa.org/addresses/${address}/utxos`);
  if (!response.ok) {
    throw new Error(`Live UTXO fetch failed for ${address}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
