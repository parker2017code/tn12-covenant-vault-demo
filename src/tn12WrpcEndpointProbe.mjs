export function summarizeTn12WrpcEndpointProbe({
  url = "",
  encoding = "json",
  networkId = "testnet-12",
  probe = {},
  generatedAt = new Date().toISOString()
} = {}) {
  const info = probe.info?.value || {};
  const currentNetwork = probe.currentNetwork?.value || {};
  const dagInfo = probe.blockDagInfo?.value || {};
  const endpointReachable = probe.info?.ok === true;
  const synced = info.isSynced === true;
  const utxoIndexed = info.isUtxoIndexed === true;
  const networkMatches = currentNetwork.network === "testnet" && dagInfo.network === "testnet-12";
  const virtualChainBaseReady = Boolean(dagInfo.virtualDaaScore && Array.isArray(dagInfo.virtualParentHashes));

  return {
    schema: "tn12-wrpc-endpoint-probe/v1",
    generatedAt,
    status: endpointReachable && synced && utxoIndexed && networkMatches && virtualChainBaseReady
      ? "tn12-wrpc-endpoint-probe-ready"
      : "tn12-wrpc-endpoint-probe-review",
    endpoint: {
      url: redactUrl(url),
      encoding,
      requestedNetworkId: networkId
    },
    checks: [
      check("endpoint-reachable", endpointReachable, "getInfo returned from the configured endpoint"),
      check("server-synced", synced, "endpoint reports isSynced=true"),
      check("utxo-indexed", utxoIndexed, "endpoint reports isUtxoIndexed=true"),
      check("network-matches", networkMatches, "current network and DAG info match TN12"),
      check("virtual-chain-base-ready", virtualChainBaseReady, "DAG info has virtual DAA score and virtual parents")
    ],
    observed: {
      serverVersion: info.serverVersion || "",
      mempoolSize: String(info.mempoolSize ?? ""),
      currentNetwork: currentNetwork.network || "",
      dagNetwork: dagInfo.network || "",
      blockCount: String(dagInfo.blockCount ?? ""),
      headerCount: String(dagInfo.headerCount ?? ""),
      virtualDaaScore: String(dagInfo.virtualDaaScore ?? ""),
      virtualParentHashes: Array.isArray(dagInfo.virtualParentHashes) ? dagInfo.virtualParentHashes.slice(0, 3) : [],
      sink: dagInfo.sink || ""
    },
    rpcCaveats: {
      serverInfoOk: probe.serverInfo?.ok === true,
      serverInfoError: probe.serverInfo?.ok === false ? probe.serverInfo.error || "" : "",
      note: "getServerInfo may fail against this public endpoint while getInfo, getCurrentNetwork, and getBlockDagInfo are still usable."
    },
    nextIndexerStep: "Use this endpoint for a bounded getVirtualChainFromBlock read only after mapping the available RpcClient method shape and preserving rollback replay.",
    boundaries: [
      "This proves endpoint reachability, not durable indexing.",
      "It does not write checkpoints or promote app state.",
      "Virtual-chain ingestion still needs bounded window reads, rollback handling, and payload/proof matching before product claims."
    ]
  };
}

function check(id, pass, detail) {
  return { id, pass, detail };
}

function redactUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
}
