import { mkdir, writeFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";
import { normalizeEncoding, testnetNetworkType } from "../src/wrpcSubmitCandidate.mjs";
import { summarizeTn12WrpcEndpointProbe } from "../src/tn12WrpcEndpointProbe.mjs";
import { summarizeVirtualChainLiveWindow } from "../src/virtualChainLiveWindow.mjs";

globalThis.WebSocket = WebSocket;

const url = process.env.TN12_VIRTUAL_CHAIN_RPC_URL || process.env.KASPA_WRPC_URL || "";
const encoding = normalizeEncoding(process.env.KASPA_WRPC_ENCODING || "json");
const networkId = testnetNetworkType();
const outPath = process.env.OUT || "artifacts/virtual-chain-live-window.json";
const minConfirmationCount = Number(process.env.TN12_VIRTUAL_CHAIN_CONFIRMATIONS || 0);

if (!url) {
  await writeArtifact(outPath, summarizeVirtualChainLiveWindow({
    endpointProbe: summarizeTn12WrpcEndpointProbe({ url, encoding: encoding.label, networkId }),
    sdk: getKaspaWasmRuntime().metadata,
    response: {}
  }));
  console.log(outPath);
  console.log("status=virtual-chain-live-window-empty");
  console.log("endpointConfigured=false");
  process.exit(0);
}

const runtime = getKaspaWasmRuntime();
const { RpcClient } = runtime.module;
if (typeof RpcClient?.prototype?.getVirtualChainFromBlockV2 !== "function") {
  throw new Error("The active kaspa-wasm module does not expose getVirtualChainFromBlockV2. Set KASPA_WASM_MODULE to the local TN12 SDK path.");
}

const rpc = RpcClient.length <= 1
  ? new RpcClient({ url, encoding: encoding.value, networkId })
  : new RpcClient(url, encoding.value, networkId);

let probe;
let request;
let response;
try {
  await rpc.connect({});
  const [serverInfo, currentNetwork, info, blockDagInfo] = await Promise.all([
    callRpc(() => rpc.getServerInfo()),
    callRpc(() => rpc.getCurrentNetwork({})),
    callRpc(() => rpc.getInfo()),
    callRpc(() => rpc.getBlockDagInfo({}))
  ]);
  probe = { serverInfo, currentNetwork, info, blockDagInfo };
  const startHash = blockDagInfo.value?.sink;
  if (!startHash) throw new Error("getBlockDagInfo did not return a sink hash for live-window startHash.");
  request = {
    startHash,
    minConfirmationCount,
    dataVerbosityLevel: "High"
  };
  response = await rpc.getVirtualChainFromBlockV2(request);
} finally {
  await rpc.disconnect();
}

const endpointProbe = summarizeTn12WrpcEndpointProbe({
  url,
  encoding: encoding.label,
  networkId,
  probe
});
const artifact = summarizeVirtualChainLiveWindow({
  endpointProbe,
  request,
  response,
  sdk: runtime.metadata
});
await writeArtifact(outPath, artifact);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`acceptedTransactions=${artifact.summary.acceptedTransactions}`);
console.log(`computeBudgetInputs=${artifact.summary.computeBudgetInputs}`);

async function callRpc(fn) {
  try {
    return {
      ok: true,
      value: await fn()
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || String(error)
    };
  }
}

async function writeArtifact(path, artifact) {
  await mkdir("artifacts", { recursive: true });
  await writeFile(path, `${JSON.stringify(artifact, (_, item) => typeof item === "bigint" ? item.toString() : item, 2)}\n`);
}
