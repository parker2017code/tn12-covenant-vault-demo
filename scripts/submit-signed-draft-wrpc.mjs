import { readFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { getKaspaWasmRuntime } from "../src/kaspaWasmRuntime.mjs";
import {
  buildWrpcSubmitArgs,
  buildWrpcTransactionFromArtifact,
  normalizeEncoding,
  summarizeWrpcCandidate,
  testnetNetworkType
} from "../src/wrpcSubmitCandidate.mjs";

globalThis.WebSocket = WebSocket;

const artifactPath = process.argv[2] || "artifacts/signed-drafts/payload-receipt-self-send.json";
const shouldSubmit = process.argv.includes("--submit");
const shouldProbe = process.argv.includes("--probe");
const shouldAllowOrphan = process.argv.includes("--allow-orphan");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const { RpcClient } = getKaspaWasmRuntime().module;
const url = process.env.KASPA_WRPC_URL || "";
const encoding = normalizeEncoding(process.env.KASPA_WRPC_ENCODING || "borsh");
const networkId = testnetNetworkType();
const submitShape = process.env.KASPA_WRPC_SUBMIT_SHAPE || "object";
const candidate = summarizeWrpcCandidate(artifact, {
  artifactPath,
  url,
  encoding: encoding.label,
  networkId
});

if (!shouldSubmit && !shouldProbe) {
  console.log(JSON.stringify({
    status: "dry-run-not-submitted",
    endpoint: url || null,
    candidate
  }, null, 2));
  process.exit(0);
}

if (!url) {
  throw new Error("KASPA_WRPC_URL is required for wRPC probe/submit. Example: KASPA_WRPC_URL=ws://127.0.0.1:18210 KASPA_WRPC_ENCODING=json KASPA_WRPC_NETWORK_ID=testnet-12 node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/payload-receipt-self-send.json --probe");
}

if (!candidate.txidMatches) {
  throw new Error(`Reconstructed transaction id ${candidate.reconstructedTransactionId} does not match artifact id ${candidate.expectedTransactionId}.`);
}

const rpc = RpcClient.length <= 1
  ? new RpcClient({ url, encoding: encoding.value, networkId })
  : new RpcClient(url, encoding.value, networkId);
try {
  await rpc.connect({});
  const tx = buildWrpcTransactionFromArtifact(artifact);
  const rpcProbe = await buildRpcProbe(rpc);
  if (shouldProbe) {
    console.log(stringifyJson({
      status: "probe-complete-not-submitted",
      endpoint: url,
      encoding: encoding.label,
      requestedNetworkId: networkId,
      submitShape,
      candidate,
      rpcProbe
    }));
    process.exit(0);
  }

  const response = await rpc.submitTransaction(...buildWrpcSubmitArgs(tx, shouldAllowOrphan, submitShape));
  console.log(stringifyJson({
    status: "submitted",
    endpoint: url,
    encoding: encoding.label,
    requestedNetworkId: networkId,
    submitShape,
    allowOrphan: shouldAllowOrphan,
    expectedTransactionId: candidate.expectedTransactionId,
    submittedTransactionId: response?.transactionId || response?.transaction_id || response || null,
    rpcProbe,
    response
  }));
} finally {
  await rpc.disconnect();
}

async function buildRpcProbe(rpc) {
  const [serverInfo, currentNetwork, info] = await Promise.all([
    callRpc(() => rpc.getServerInfo()),
    callRpc(() => rpc.getCurrentNetwork({})),
    callRpc(() => rpc.getInfo())
  ]);
  return {
    serverInfo,
    currentNetwork,
    info
  };
}

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

function stringifyJson(value) {
  return JSON.stringify(value, (_, item) => typeof item === "bigint" ? item.toString() : item, 2);
}
