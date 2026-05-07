import { readFile, writeFile } from "node:fs/promises";
import { blake2b } from "blakejs";

const contracts = [
  {
    lane: "vault",
    contract: "DelayedRecoveryVault",
    fundingDraftPath: "artifacts/signed-drafts/vault-funding.json",
    outputIndex: 0,
    artifactPath: "artifacts/DelayedRecoveryVault.json",
    outPath: "fixtures/VaultContractOutpoint.json"
  },
  {
    lane: "assurance",
    contract: "AssurancePledge",
    fundingDraftPath: "artifacts/signed-drafts/assurance-pledge.json",
    outputIndex: 0,
    artifactPath: "artifacts/AssurancePledge.json",
    outPath: "fixtures/AssuranceContractOutpoint.json"
  }
];

for (const item of contracts) {
  const artifact = JSON.parse(await readFile(item.artifactPath, "utf8"));
  const fundingDraft = JSON.parse(await readFile(item.fundingDraftPath, "utf8"));
  const txid = process.env[`${item.lane.toUpperCase()}_CONTRACT_TXID`] || fundingDraft.transactionId;
  const tx = await fetchTransaction(txid);
  const output = tx.outputs.find((candidate) => Number(candidate.index) === item.outputIndex);

  if (!output) {
    throw new Error(`${txid}:${item.outputIndex} was not found in TN12 API response.`);
  }

  const redeemScript = Uint8Array.from(artifact.script);
  const fixture = {
    schema: "tn12-contract-outpoint/v1",
    network: "kaspa-testnet-12",
    lane: item.lane,
    contract: item.contract,
    status: tx.is_accepted ? "accepted" : "seen-not-accepted",
    fetchedAt: new Date().toISOString(),
    endpoint: `https://api-tn12.kaspa.org/transactions/${txid}`,
    txid,
    outputIndex: item.outputIndex,
    amountSompi: String(output.amount),
    amountTkas: Number(output.amount) / 100000000,
    scriptType: output.script_public_key_type,
    scriptPublicKey: output.script_public_key,
    scriptPublicKeyAddress: output.script_public_key_address,
    redeemScriptHex: bytesToHex(redeemScript),
    redeemScriptBytes: redeemScript.length,
    redeemScriptHash: bytesToHex(blake2b(redeemScript, undefined, 32)),
    explorerUrl: `https://tn12.kaspa.stream/txs/${txid}`,
    rawTransaction: tx,
    raw: {
      address: output.script_public_key_address,
      outpoint: {
        transactionId: txid,
        index: item.outputIndex
      },
      utxoEntry: {
        amount: String(output.amount),
        scriptPublicKey: {
          scriptPublicKey: output.script_public_key
        },
        blockDaaScore: String(tx.accepting_block_blue_score ?? "0"),
        isCoinbase: false
      }
    }
  };

  await writeFile(item.outPath, `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(`${item.outPath} ${fixture.scriptPublicKeyAddress}`);
}

async function fetchTransaction(txid) {
  const endpoint = `https://api-tn12.kaspa.org/transactions/${txid}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Transaction fetch failed for ${txid}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
