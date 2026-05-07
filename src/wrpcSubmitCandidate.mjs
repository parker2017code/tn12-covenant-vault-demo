import { getKaspaWasmRuntime } from "./kaspaWasmRuntime.mjs";
import { normalizePayloadBytes } from "./submitPayload.mjs";

const ZERO_TXID = "0000000000000000000000000000000000000000000000000000000000000000";

export function buildWrpcTransactionFromArtifact(artifact = {}) {
  const { Transaction } = getKaspaWasmRuntime().module;
  const submit = artifact.submitPayload?.transaction;
  if (!submit) {
    throw new Error("Signed artifact is missing submitPayload.transaction.");
  }

  const txVersion = Number(submit.version || 0);
  const tx = new Transaction({
    version: submit.version,
    inputs: submit.inputs.map((input) => buildRuntimeInput(input, txVersion)),
    outputs: submit.outputs.map((output) => ({
      value: output.amount,
      scriptPublicKey: `${Number(output.scriptPublicKey.version).toString(16).padStart(4, "0")}${output.scriptPublicKey.scriptPublicKey}`
    })),
    lockTime: normalizeUint64(submit.lockTime || 0),
    subnetworkId: submit.subnetworkId || "0000000000000000000000000000000000000000",
    gas: 0n,
    payload: submit.payload || ""
  });
  tx.finalize();
  return tx;
}

export function summarizeWrpcCandidate(artifact = {}, options = {}) {
  const runtime = getKaspaWasmRuntime();
  const tx = buildWrpcTransactionFromArtifact(artifact);
  const submit = artifact.submitPayload?.transaction || {};
  const payload = normalizePayloadBytes(tx.payload);
  const expectedTxid = artifact.transactionId || null;
  const actualTxid = tx.id;
  const txidMatches = !expectedTxid || expectedTxid === actualTxid;
  const encoding = normalizeEncoding(options.encoding || "borsh");
  const url = options.url || process.env.KASPA_WRPC_URL || "";
  const artifactPath = options.artifactPath || "artifacts/signed-drafts/payload-receipt-self-send.json";

  return {
    schema: "tn12-wrpc-submit-candidate/v1",
    network: options.network || "kaspa-testnet-12",
    status: url ? "wrpc-url-configured" : "needs-kaspa-wrpc-url",
    artifactPath,
    expectedTransactionId: expectedTxid,
    reconstructedTransactionId: actualTxid,
    txidMatches,
    payloadBytes: payload.length,
    outputs: tx.outputs.length,
    inputs: tx.inputs.length,
    txVersion: Number(tx.version || 0),
    encoding: encoding.label,
    sdk: {
      package: runtime.metadata.package,
      version: runtime.metadata.version,
      source: runtime.metadata.source,
      inputBudgetSupport: detectInputBudgetSupport()
    },
    requestedNetworkId: normalizeNetworkId(options.networkId || process.env.KASPA_WRPC_NETWORK_ID || "testnet-12"),
    budgetMode: Number(tx.version || 0) >= 1 ? "computeBudget" : "sigOpCount",
    localConstructionBudgetField: Number(tx.version || 0) >= 1 ? "sigOpCount-zero-plus-computeBudget" : "sigOpCount",
    localTxidCaveat: Number(tx.version || 0) >= 1
      ? "The local txid match is a reconstruction diagnostic only. Installed kaspa-wasm requires sigOpCount and rejects computeBudget, while TN12 v1 consensus expects computeBudget; use a matching TN12 WASM/API before treating submit failures as protocol behavior."
      : null,
    inputBudgets: (submit.inputs || []).map((input) => ({
      sigOpCount: input.sigOpCount ?? null,
      computeBudget: input.computeBudget ?? null
    })),
    urlConfigured: Boolean(url),
    dryRunCommand: `node scripts/submit-signed-draft-wrpc.mjs ${artifactPath}`,
    probeCommand: `KASPA_WRPC_URL=<ws-or-wss-url> node scripts/submit-signed-draft-wrpc.mjs ${artifactPath} --probe`,
    submitCommand: `KASPA_WRPC_URL=<ws-or-wss-url> node scripts/submit-signed-draft-wrpc.mjs ${artifactPath} --submit`,
    boundary: "Use this only with a trusted TN12 wRPC endpoint. Confirm network id, server version, SDK version, txid, and v1 compute-budget handling before treating submit errors as protocol behavior. kaspa-wasm builds that require sigOpCount and reject computeBudget are not authoritative for v1 compute-budget serialization."
  };
}

export function detectInputBudgetSupport() {
  const { TransactionInput } = getKaspaWasmRuntime().module;
  const baseInput = {
    previousOutpoint: {
      transactionId: ZERO_TXID,
      index: 0
    },
    signatureScript: [],
    sequence: 0n
  };

  const withComputeBudget = constructInputJson(TransactionInput, { ...baseInput, sigOpCount: 0, computeBudget: 1 });

  return {
    acceptsComputeBudgetOnly: canConstructInput(TransactionInput, { ...baseInput, computeBudget: 1 }),
    requiresSigOpCountProperty: !canConstructInput(TransactionInput, { ...baseInput, computeBudget: 1 }),
    acceptsSigOpCount: canConstructInput(TransactionInput, { ...baseInput, sigOpCount: 1 }),
    acceptsSigOpCountZeroPlusComputeBudget: withComputeBudget.ok,
    preservesComputeBudget: Number(withComputeBudget.json?.computeBudget || 0) === 1,
    note: "TN12 consensus v1 expects computeBudget. A usable JS SDK path may still require sigOpCount: 0 as a compatibility constructor field, but it must preserve computeBudget in the runtime object."
  };
}

function buildRuntimeInput(input, txVersion) {
  const runtimeInput = {
    previousOutpoint: input.previousOutpoint,
    signatureScript: input.signatureScript,
    sequence: normalizeUint64(input.sequence)
  };
  if (txVersion >= 1 && input.computeBudget != null) {
    runtimeInput.sigOpCount = 0;
    runtimeInput.computeBudget = input.computeBudget;
  } else {
    runtimeInput.sigOpCount = input.sigOpCount ?? 0;
  }
  return runtimeInput;
}

function canConstructInput(TransactionInput, input) {
  return constructInputJson(TransactionInput, input).ok;
}

function constructInputJson(TransactionInput, input) {
  try {
    const transactionInput = new TransactionInput(input);
    const json = transactionInput.toJSON?.() || null;
    transactionInput.free?.();
    return { ok: true, json };
  } catch {
    return { ok: false, json: null };
  }
}

function normalizeUint64(value) {
  return typeof value === "bigint" ? value : BigInt(value ?? 0);
}

export function normalizeEncoding(value) {
  const { Encoding } = getKaspaWasmRuntime().module;
  const normalized = String(value || "borsh").toLowerCase();
  if (normalized === "json" || normalized === "serdejson" || normalized === "serde-json") {
    return { label: "json", value: Encoding.SerdeJson };
  }
  return { label: "borsh", value: Encoding.Borsh };
}

export function testnetNetworkType() {
  return normalizeNetworkId(process.env.KASPA_WRPC_NETWORK_ID || "testnet-12");
}

export function normalizeNetworkId(value) {
  return String(value || "testnet-12");
}

export function buildWrpcSubmitArgs(tx, allowOrphan, shape = process.env.KASPA_WRPC_SUBMIT_SHAPE || "object") {
  if (shape === "object" || shape === "request") {
    return [{ transaction: tx, allowOrphan }];
  }
  return [tx, allowOrphan];
}
