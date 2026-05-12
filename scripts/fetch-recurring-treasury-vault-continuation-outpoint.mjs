import { mkdir, readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.DRAFT || "artifacts/signed-drafts/recurring-treasury-vault-live-spend.json";
const evidencePath = process.env.EVIDENCE || "artifacts/recurring-treasury-vault-live-spend-evidence.json";
const outPath = process.env.OUT || "fixtures/RecurringTreasuryVaultContinuationOutpoint.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const draft = JSON.parse(await readFile(draftPath, "utf8"));
const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
const txid = process.env.TXID || draft.transactionId;
const outputIndex = Number(process.env.OUTPUT_INDEX || 1);
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);
if (!response.ok) {
  throw new Error(`Continuation fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const output = (tx.outputs || []).find((item) => Number(item.index) === outputIndex);
if (!output) {
  throw new Error(`Output ${outputIndex} not found on ${txid}`);
}
const expected = draft.submitPayload.transaction.outputs[outputIndex];
if (String(output.amount) !== String(expected.amount)) {
  throw new Error(`Continuation amount mismatch: expected ${expected.amount}, got ${output.amount}`);
}
if (output.script_public_key !== expected.scriptPublicKey.scriptPublicKey) {
  throw new Error("Continuation scriptPublicKey does not match the signed draft");
}

const artifact = {
  schema: "tn12-contract-outpoint/v1",
  network: "kaspa-testnet-12",
  lane: "recurring-treasury-vault-continuation",
  contract: "RecurringTreasuryVault",
  fetchedAt: new Date().toISOString(),
  endpoint,
  txid,
  outputIndex,
  amountTkas: Number(output.amount) / 100000000,
  amountSompi: String(output.amount),
  scriptType: output.script_public_key_type,
  scriptPublicKeyAddress: output.script_public_key_address,
  scriptPublicKey: output.script_public_key,
  covenantId: draft.source.covenantId,
  redeemScriptHex: draft.scriptEvidence.nextRedeemScriptHex,
  redeemScriptBytes: draft.scriptEvidence.nextRedeemScriptHex.length / 2,
  status: tx.is_accepted ? "accepted-continuation-active" : "submitted-not-yet-accepted",
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
  state: {
    capSompi: String(draft.state.capSompi),
    windowStart: String(draft.state.windowStart),
    spentInWindowSompi: String(draft.state.nextSpentSompi),
    minerFeeSompi: String(draft.state.minerFeeSompi)
  },
  sourceEvidence: {
    draft: draftPath,
    evidence: evidencePath,
    spendTxid: evidence.txid,
    output1ContinuationAmountMatchesDraft: evidence.checks?.output1ContinuationAmountMatchesDraft === true,
    output1ContinuationScriptMatchesDraft: evidence.checks?.output1ContinuationScriptMatchesDraft === true,
    output1ContinuationCovenantMatchesDraft: evidence.checks?.output1ContinuationCovenantMatchesDraft === true
  },
  raw: {
    address: output.script_public_key_address,
    outpoint: {
      transactionId: txid,
      index: outputIndex
    },
    utxoEntry: {
      amount: String(output.amount),
      scriptPublicKey: {
        scriptPublicKey: output.script_public_key
      },
      blockDaaScore: String(tx.accepting_block_blue_score ?? ""),
      isCoinbase: false
    }
  }
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} ${txid}:${outputIndex}`);
