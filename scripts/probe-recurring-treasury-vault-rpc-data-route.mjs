import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import WebSocket from "isomorphic-ws";

const localWasm = "/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa";
if (!process.env.KASPA_WASM_MODULE && existsSync(localWasm)) {
  process.env.KASPA_WASM_MODULE = localWasm;
}

const { getKaspaWasmRuntime } = await import("../src/kaspaWasmRuntime.mjs");
const { normalizeEncoding } = await import("../src/wrpcSubmitCandidate.mjs");

globalThis.WebSocket = WebSocket;

const contractOutpoint = await readJson("fixtures/RecurringTreasuryVaultContractOutpoint.json");
const endpoint = process.env.KASPA_WRPC_URL || process.env.TN12_VIRTUAL_CHAIN_RPC_URL || "ws://tn12-node.kaspa.com:17210";
const encoding = normalizeEncoding(process.env.KASPA_WRPC_ENCODING || "borsh");
const networkId = process.env.KASPA_WRPC_NETWORK_ID || "testnet-12";
const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-rpc-data-route.json";

const { RpcClient } = getKaspaWasmRuntime().module;
const rpc = RpcClient.length <= 1
  ? new RpcClient({ url: endpoint, encoding: encoding.value, networkId })
  : new RpcClient(endpoint, encoding.value, networkId);

let artifact;
try {
  await rpc.connect({});
  const utxos = await rpc.getUtxosByAddresses({ addresses: [contractOutpoint.scriptPublicKeyAddress] });
  const matchingUtxo = findMatchingUtxo(utxos?.entries || [], contractOutpoint);
  const fundingTx = await fetchFundingTx(rpc, contractOutpoint);
  const fundingOutput = fundingTx?.outputs?.[Number(contractOutpoint.outputIndex)] || null;
  const outputCovenant = normalizeCovenant(fundingOutput?.covenant || fundingOutput?.covenantBinding || null);
  const utxoCovenant = normalizeCovenant(matchingUtxo?.covenant || matchingUtxo?.covenantId || matchingUtxo?.entry?.covenant || matchingUtxo?.entry?.covenantId || null);

  artifact = {
    schema: "tn12-recurring-treasury-vault-rpc-data-route/v1",
    checkedAt: new Date().toISOString(),
    status: outputCovenant || utxoCovenant ? "rpc-data-route-covenant-id-found" : "funded-output-not-covenant-bound",
    endpoint: {
      url: endpoint,
      encoding: encoding.label,
      networkId
    },
    target: "Find whether the funded RecurringTreasuryVault output carries a live covenant_id through wRPC block or UTXO data.",
    fundingOutpoint: {
      txid: contractOutpoint.txid,
      outputIndex: contractOutpoint.outputIndex,
      address: contractOutpoint.scriptPublicKeyAddress
    },
    checks: {
      wrpcUtxoFound: Boolean(matchingUtxo),
      wrpcUtxoCovenantIdAvailable: Boolean(utxoCovenant),
      fundingTransactionFetched: Boolean(fundingTx),
      fundingTransactionVersion: fundingTx?.version ?? null,
      fundingOutputFound: Boolean(fundingOutput),
      fundingOutputHasCovenantBinding: Boolean(outputCovenant)
    },
    observed: {
      utxoKeys: matchingUtxo ? Object.keys(matchingUtxo).sort() : [],
      utxoEntryKeys: matchingUtxo?.entry ? Object.keys(matchingUtxo.entry).sort() : [],
      fundingOutputKeys: fundingOutput ? Object.keys(fundingOutput).sort() : [],
      fundingOutputScriptPublicKey: normalizeScriptPublicKey(fundingOutput?.scriptPublicKey),
      fundingOutputValue: fundingOutput?.value?.toString?.() || fundingOutput?.value || null,
      fundingOutputCovenant: outputCovenant,
      wrpcUtxoCovenant: utxoCovenant
    },
    blockers: outputCovenant || utxoCovenant ? [] : [
      {
        id: "funded-output-not-covenant-bound",
        status: "hard-blocker",
        detail: "The current funded output is visible through wRPC, but neither the UTXO row nor the funding transaction output exposes a covenant binding. The funding transaction is not a covenant-genesis output."
      }
    ],
    allowedNextAction: outputCovenant || utxoCovenant
      ? "Use the discovered covenant id in the guarded Rust live-spend candidate."
      : "Create a new covenant-bound funded output through the KIP-20/DECL genesis path before attempting a live recurring-vault spend."
  };
} finally {
  await rpc.disconnect();
}

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, bigintReplacer, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function fetchFundingTx(rpc, outpoint) {
  const tx = await fetch(`https://api-tn12.kaspa.org/transactions/${outpoint.txid}`).then((response) => response.ok ? response.json() : null);
  const blockHash = Array.isArray(tx?.block_hash) ? tx.block_hash[0] : null;
  if (!blockHash) return null;
  const block = await rpc.getBlock({ hash: blockHash, includeTransactions: true });
  return (block?.block?.transactions || []).find((item) => item.verboseData?.transactionId === outpoint.txid) || null;
}

function findMatchingUtxo(entries, outpoint) {
  return entries.find((entry) => {
    const row = entry.outpoint || entry.entry?.outpoint || {};
    return row.transactionId === outpoint.txid && Number(row.index) === Number(outpoint.outputIndex);
  }) || null;
}

function normalizeScriptPublicKey(spk) {
  if (!spk) return null;
  return typeof spk === "string" ? spk : spk.script || null;
}

function normalizeCovenant(value) {
  if (!value) return null;
  if (typeof value === "string") return { authorizingInput: null, covenantId: value };
  const json = value.toJSON?.() || value;
  return {
    authorizingInput: json.authorizingInput ?? null,
    covenantId: json.covenantId?.toString?.() || json.covenantId || json.toString?.() || null
  };
}

function bigintReplacer(_key, value) {
  return typeof value === "bigint" ? value.toString() : value;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
