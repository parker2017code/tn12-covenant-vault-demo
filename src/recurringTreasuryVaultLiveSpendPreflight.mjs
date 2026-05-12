import { blake2b } from "blakejs";

export function buildRecurringTreasuryVaultLiveSpendPreflight({
  compiledArtifact = {},
  constructorArgs = [],
  contractOutpoint = {},
  ownerSigProof = {},
  rustSubmitRouteProbe = {},
  rpcDataRoute = null,
  liveSpendEvidence = null,
  liveUtxos = [],
  checkedAt = new Date().toISOString()
} = {}) {
  const redeemScriptHex = bytesToHex(compiledArtifact.script || []);
  const scriptHash = bytesToHex(blake2b(Uint8Array.from(compiledArtifact.script || []), undefined, 32));
  const expectedP2sh = `aa20${scriptHash}87`;
  const matchingLiveUtxo = findLiveUtxo(liveUtxos, contractOutpoint);
  const restCovenantId = getLiveCovenantId(matchingLiveUtxo);
  const rpcCovenantId = getRpcDataRouteCovenantId(rpcDataRoute);
  const liveCovenantId = restCovenantId || rpcCovenantId;
  const scriptMatches = redeemScriptHex === contractOutpoint.redeemScriptHex;
  const p2shMatches = expectedP2sh === contractOutpoint.scriptPublicKey;
  const ownerSigPassed = ownerSigProof.status === "local-owner-sig-covenant-proof-passed";
  const rustRouteReady = rustSubmitRouteProbe.status === "rust-submit-route-preserves-covenant-binding";
  const fundingUnspent = Boolean(matchingLiveUtxo);
  const acceptedSpendRecorded = liveSpendEvidence?.status === "accepted-script-enforced-under-cap-spend";
  const rpcDataRouteChecked = Boolean(rpcDataRoute?.schema);
  const fundedOutputCovenantBound = rpcDataRoute?.status === "rpc-data-route-covenant-id-found";
  const constructorState = readConstructorState(constructorArgs);

  const blockers = [];
  if (!scriptMatches) blockers.push(blocker("compiled-script-mismatch", "Compiled script does not match the funded redeem script."));
  if (!p2shMatches) blockers.push(blocker("p2sh-mismatch", "Funded scriptPublicKey does not match the compiled redeem script hash."));
  if (!ownerSigPassed) blockers.push(blocker("owner-sig-proof-missing", "Local ownerSig proof is not passing."));
  if (!rustRouteReady) blockers.push(blocker("rust-submit-route-unproven", "Rust submit route has not proven covenant binding preservation."));
  if (!fundingUnspent && !acceptedSpendRecorded) blockers.push(blocker("funded-output-not-live", "The funded contract output was not found in the live UTXO response."));
  if (rpcDataRouteChecked && !fundedOutputCovenantBound) blockers.push(blocker("funded-output-not-covenant-bound", "wRPC found the funded output and funding transaction, but the output is not covenant-bound."));
  if (!liveCovenantId) blockers.push(blocker("live-covenant-id-unavailable", "No checked REST or wRPC route exposes covenant_id for the funded output."));

  const status = acceptedSpendRecorded
    ? "accepted-script-enforced-under-cap-spend"
    : blockers.length === 0
    ? "ready-for-guarded-live-submit"
    : blockers.some((item) => item.id === "funded-output-not-covenant-bound")
      ? "blocked-non-covenant-funded-output"
      : blockers.some((item) => item.id === "live-covenant-id-unavailable")
      ? "blocked-covenant-id-unavailable"
      : "blocked-before-live-submit";

  return {
    schema: "tn12-recurring-treasury-vault-live-spend-preflight/v1",
    checkedAt,
    status,
    target: "Spend the funded RecurringTreasuryVault output through a route that preserves the covenant-bound continuation output.",
    fundingOutpoint: {
      txid: contractOutpoint.txid || null,
      outputIndex: contractOutpoint.outputIndex ?? null,
      amountSompi: contractOutpoint.amountSompi || null,
      address: contractOutpoint.scriptPublicKeyAddress || null,
      explorerUrl: contractOutpoint.explorerUrl || null
    },
    constructorState,
    checks: {
      compiledScriptMatchesFundedRedeemScript: scriptMatches,
      compiledP2shMatchesFundedScriptPublicKey: p2shMatches,
      ownerSigProofPassed: ownerSigPassed,
      rustSubmitRoutePreservesCovenantBinding: rustRouteReady,
      fundedOutputStillUnspent: fundingUnspent,
      acceptedSpendRecorded,
      rpcDataRouteChecked,
      fundedOutputCovenantBound,
      liveUtxoCovenantIdAvailable: Boolean(liveCovenantId),
      restUtxoCovenantIdAvailable: Boolean(restCovenantId),
      wrpcCovenantIdAvailable: Boolean(rpcCovenantId)
    },
    rpcDataRoute: rpcDataRouteChecked ? {
      status: rpcDataRoute.status,
      fundingTransactionVersion: rpcDataRoute.checks?.fundingTransactionVersion ?? null,
      fundingOutputHasCovenantBinding: Boolean(rpcDataRoute.checks?.fundingOutputHasCovenantBinding),
      wrpcUtxoCovenantIdAvailable: Boolean(rpcDataRoute.checks?.wrpcUtxoCovenantIdAvailable)
    } : null,
    liveUtxo: matchingLiveUtxo ? {
      amount: matchingLiveUtxo.utxoEntry?.amount || null,
      blockDaaScore: matchingLiveUtxo.utxoEntry?.blockDaaScore || null,
      hasCovenantId: Boolean(liveCovenantId),
      covenantId: liveCovenantId,
      covenantIdSource: restCovenantId ? "rest-utxo" : rpcCovenantId ? "wrpc-data-route" : null
    } : null,
    acceptedSpend: acceptedSpendRecorded ? {
      txid: liveSpendEvidence.txid,
      explorerUrl: liveSpendEvidence.explorerUrl,
      acceptingBlockBlueScore: liveSpendEvidence.acceptingBlockBlueScore,
      output0AmountMatchesSpend: Boolean(liveSpendEvidence.checks?.output0AmountMatchesSpend),
      output1ContinuationScriptMatchesDraft: Boolean(liveSpendEvidence.checks?.output1ContinuationScriptMatchesDraft)
    } : null,
    blockers,
    allowedNextAction: status === "accepted-script-enforced-under-cap-spend"
      ? "Record the continuation output as the next active state before attempting another spend."
      : status === "ready-for-guarded-live-submit"
      ? "Build the signed Rust live-spend candidate and submit only with an explicit --submit flag."
      : status === "blocked-non-covenant-funded-output"
        ? "Create a new covenant-bound funded output through the KIP-20/DECL genesis path before attempting a live recurring-vault spend."
      : "Fetch the funded UTXO through RPC/data verbosity that exposes covenant_id, then re-run this preflight before building a live spend candidate.",
    safetyRule: "Do not broadcast the recurring-vault spend until the funded input covenant_id and continuation output covenant binding are both known."
  };
}

function findLiveUtxo(liveUtxos, contractOutpoint) {
  return liveUtxos.find((item) => {
    const outpoint = item.outpoint || {};
    return outpoint.transactionId === contractOutpoint.txid && Number(outpoint.index) === Number(contractOutpoint.outputIndex);
  }) || null;
}

function getLiveCovenantId(utxo) {
  return utxo?.utxoEntry?.covenant_id || utxo?.utxoEntry?.covenantId || null;
}

function getRpcDataRouteCovenantId(rpcDataRoute) {
  return rpcDataRoute?.observed?.wrpcUtxoCovenant?.covenantId
    || rpcDataRoute?.observed?.fundingOutputCovenant?.covenantId
    || null;
}

function readConstructorState(args) {
  return {
    ownerXOnlyPublicKey: readByteArrayHex(args[0]),
    destinationXOnlyPublicKey: readByteArrayHex(args[1]),
    capSompi: String(args[2]?.data ?? ""),
    windowStart: String(args[3]?.data ?? ""),
    spentInWindowSompi: String(args[4]?.data ?? ""),
    minerFeeSompi: String(args[5]?.data ?? "")
  };
}

function readByteArrayHex(arg) {
  return Array.isArray(arg?.data)
    ? arg.data.map((item) => Number(item.data).toString(16).padStart(2, "0")).join("")
    : "";
}

function blocker(id, detail) {
  return { id, status: "hard-blocker", detail };
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => Number(byte).toString(16).padStart(2, "0"))
    .join("");
}
