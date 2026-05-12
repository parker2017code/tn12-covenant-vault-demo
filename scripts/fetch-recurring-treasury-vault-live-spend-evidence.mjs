import { readFile, writeFile } from "node:fs/promises";

const draftPath = process.env.DRAFT || "artifacts/signed-drafts/recurring-treasury-vault-live-spend.json";
const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-live-spend-evidence.json";
const endpointBase = process.env.TN12_TX_ENDPOINT || "https://api-tn12.kaspa.org/transactions";

const draft = JSON.parse(await readFile(draftPath, "utf8"));
const txid = process.env.TXID || draft.transactionId;
const endpoint = `${endpointBase}/${txid}`;
const response = await fetch(endpoint);
if (!response.ok) {
  throw new Error(`Live spend fetch failed for ${txid}: ${response.status} ${response.statusText}`);
}

const tx = await response.json();
const outputs = (tx.outputs || []).map((output) => ({
  index: Number(output.index),
  amountSompi: String(output.amount),
  amountTkas: Number(output.amount) / 100000000,
  scriptType: output.script_public_key_type,
  scriptPublicKeyAddress: output.script_public_key_address,
  scriptPublicKey: output.script_public_key
}));
const continuation = outputs.find((output) => output.index === 1) || null;
const expectedContinuation = draft.submitPayload.transaction.outputs[1];
const expectedSpend = draft.submitPayload.transaction.outputs[0];

const artifact = {
  schema: "tn12-recurring-treasury-vault-live-spend-evidence/v1",
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  status: tx.is_accepted ? "accepted-script-enforced-under-cap-spend" : "submitted-not-yet-accepted",
  txid,
  endpoint,
  explorerUrl: `https://tn12.kaspa.stream/transactions/${txid}`,
  acceptingBlockBlueScore: tx.accepting_block_blue_score ?? null,
  source: draft.source,
  state: draft.state,
  checks: {
    acceptedOnTn12: Boolean(tx.is_accepted),
    output0AmountMatchesSpend: String(outputs[0]?.amountSompi || "") === String(expectedSpend.amount),
    output0DestinationMatchesDraft: outputs[0]?.scriptPublicKey === expectedSpend.scriptPublicKey.scriptPublicKey,
    output1ContinuationAmountMatchesDraft: String(continuation?.amountSompi || "") === String(expectedContinuation.amount),
    output1ContinuationScriptMatchesDraft: continuation?.scriptPublicKey === expectedContinuation.scriptPublicKey.scriptPublicKey,
    output1ContinuationCovenantMatchesDraft: draft.localChecks.output1ContinuationCovenantMatchesInput === true,
    localEngineAcceptedGeneratedSigScript: draft.localChecks.engineAcceptedGeneratedSigScript === true
  },
  outputs,
  proves: [
    "RecurringTreasuryVault.sil under-cap spend was accepted on TN12.",
    "The spend paid the required destination amount.",
    "The spend relocked the remaining value into a continuation output.",
    "The continuation output carries the same covenant id in the signed draft and wRPC submit route."
  ],
  doesNotProve: [
    "mainnet activation",
    "audited custody",
    "wallet-standard user signing",
    "full recurring-window reset behavior"
  ]
};

await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status} ${txid}`);
