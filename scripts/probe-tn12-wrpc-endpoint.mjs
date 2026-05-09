import { mkdir, writeFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";
import { normalizeEncoding, testnetNetworkType } from "../src/wrpcSubmitCandidate.mjs";
import { summarizeTn12WrpcEndpointProbe } from "../src/tn12WrpcEndpointProbe.mjs";

globalThis.WebSocket = WebSocket;

const url = process.env.TN12_VIRTUAL_CHAIN_RPC_URL || process.env.KASPA_WRPC_URL || "";
const encoding = normalizeEncoding(process.env.KASPA_WRPC_ENCODING || "json");
const networkId = testnetNetworkType();
const outPath = process.env.OUT || "artifacts/tn12-wrpc-endpoint-probe.json";

if (!url) {
  const artifact = summarizeTn12WrpcEndpointProbe({ url, encoding: encoding.label, networkId });
  await writeArtifact(outPath, artifact);
  console.log(outPath);
  console.log(`status=${artifact.status}`);
  console.log("endpointConfigured=false");
  process.exit(0);
}

const { RpcClient } = getKaspaWasmRuntime().module;
const rpc = RpcClient.length <= 1
  ? new RpcClient({ url, encoding: encoding.value, networkId })
  : new RpcClient(url, encoding.value, networkId);

let probe;
try {
  await rpc.connect({});
  probe = {
    serverInfo: await callRpc(() => rpc.getServerInfo()),
    currentNetwork: await callRpc(() => rpc.getCurrentNetwork({})),
    info: await callRpc(() => rpc.getInfo()),
    blockDagInfo: await callRpc(() => rpc.getBlockDagInfo())
  };
} finally {
  await rpc.disconnect();
}

const artifact = summarizeTn12WrpcEndpointProbe({
  url,
  encoding: encoding.label,
  networkId,
  probe
});
await writeArtifact(outPath, artifact);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`serverVersion=${artifact.observed.serverVersion}`);
console.log(`virtualDaaScore=${artifact.observed.virtualDaaScore}`);

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
  await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`);
}
