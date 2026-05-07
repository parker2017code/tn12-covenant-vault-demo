import { readFile } from "node:fs/promises";
import WebSocket from "isomorphic-ws";
import { RpcClient } from "kaspa-wasm";
import {
  buildWrpcTransactionFromArtifact,
  normalizeEncoding,
  summarizeWrpcCandidate,
  testnetNetworkType
} from "../src/wrpcSubmitCandidate.mjs";

globalThis.WebSocket = WebSocket;

const artifactPath = process.argv[2] || "artifacts/signed-drafts/payload-receipt-self-send.json";
const shouldSubmit = process.argv.includes("--submit");
const shouldAllowOrphan = process.argv.includes("--allow-orphan");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const url = process.env.KASPA_WRPC_URL || "";
const encoding = normalizeEncoding(process.env.KASPA_WRPC_ENCODING || "borsh");
const candidate = summarizeWrpcCandidate(artifact, {
  artifactPath,
  url,
  encoding: encoding.label
});

if (!shouldSubmit) {
  console.log(JSON.stringify({
    status: "dry-run-not-submitted",
    endpoint: url || null,
    candidate
  }, null, 2));
  process.exit(0);
}

if (!url) {
  throw new Error("KASPA_WRPC_URL is required for wRPC submit. Example: KASPA_WRPC_URL=ws://127.0.0.1:17210 node scripts/submit-signed-draft-wrpc.mjs artifacts/signed-drafts/payload-receipt-self-send.json --submit");
}

if (!candidate.txidMatches) {
  throw new Error(`Reconstructed transaction id ${candidate.reconstructedTransactionId} does not match artifact id ${candidate.expectedTransactionId}.`);
}

const rpc = new RpcClient(url, encoding.value, testnetNetworkType());
try {
  await rpc.connect({});
  const tx = buildWrpcTransactionFromArtifact(artifact);
  const response = await rpc.submitTransaction(tx, shouldAllowOrphan);
  console.log(JSON.stringify({
    status: "submitted",
    endpoint: url,
    encoding: encoding.label,
    allowOrphan: shouldAllowOrphan,
    expectedTransactionId: candidate.expectedTransactionId,
    submittedTransactionId: response?.transactionId || response?.transaction_id || response || null,
    response
  }, null, 2));
} finally {
  await rpc.disconnect();
}
