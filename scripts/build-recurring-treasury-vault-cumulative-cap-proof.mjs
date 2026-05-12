import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-cumulative-cap-proof.json";

const firstEvidence = await readJson("artifacts/recurring-treasury-vault-live-spend-evidence.json");
const firstContinuation = await readJson("fixtures/RecurringTreasuryVaultContinuationOutpoint.json");
const secondDraft = await readJson("artifacts/signed-drafts/recurring-treasury-vault-cumulative-spend.json");
const secondEvidence = await readJson("artifacts/recurring-treasury-vault-cumulative-spend-evidence.json");
const secondContinuation = await readJson("fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json");
const overCap = await readJson("artifacts/signed-drafts/recurring-treasury-vault-cumulative-over-cap.json");

const acceptedSpends = [
  acceptedSpend("first-under-cap", firstEvidence),
  acceptedSpend("second-cumulative-under-cap", secondEvidence)
];
const capSompi = String(secondEvidence.state.capSompi);
const totalAcceptedSompi = String(Number(firstEvidence.state.spendAmountSompi) + Number(secondEvidence.state.spendAmountSompi));

const artifact = {
  schema: "tn12-recurring-treasury-vault-cumulative-cap-proof/v1",
  network: "kaspa-testnet-12",
  checkedAt: new Date().toISOString(),
  status: "accepted-cumulative-under-cap-plus-local-over-cap-reject",
  contract: "contracts/RecurringTreasuryVault.sil",
  covenantId: secondEvidence.source.covenantId,
  capSompi,
  capTkas: Number(capSompi) / 100000000,
  acceptedSpends,
  continuationChain: [
    {
      id: "after-first-spend",
      fixture: "fixtures/RecurringTreasuryVaultContinuationOutpoint.json",
      txid: firstContinuation.txid,
      outputIndex: firstContinuation.outputIndex,
      amountSompi: firstContinuation.amountSompi,
      spentInWindowSompi: firstContinuation.state.spentInWindowSompi
    },
    {
      id: "after-second-spend",
      fixture: "fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json",
      txid: secondContinuation.txid,
      outputIndex: secondContinuation.outputIndex,
      amountSompi: secondContinuation.amountSompi,
      spentInWindowSompi: secondContinuation.state.spentInWindowSompi
    }
  ],
  cumulative: {
    firstSpendSompi: String(firstEvidence.state.spendAmountSompi),
    secondSpendSompi: String(secondEvidence.state.spendAmountSompi),
    totalAcceptedSompi,
    totalAcceptedTkas: Number(totalAcceptedSompi) / 100000000,
    nextSpentInWindowSompi: String(secondEvidence.state.nextSpentSompi),
    underCap: Number(secondEvidence.state.nextSpentSompi) <= Number(secondEvidence.state.capSompi)
  },
  blockedCandidate: {
    artifact: "artifacts/signed-drafts/recurring-treasury-vault-cumulative-over-cap.json",
    status: overCap.status,
    transactionId: overCap.transactionId,
    previousOutpoint: overCap.source.contractOutpoint,
    prevSpentSompi: String(overCap.state.prevSpentSompi),
    spendAmountSompi: String(overCap.state.spendAmountSompi),
    attemptedNextSpentSompi: String(overCap.state.nextSpentSompi),
    exceedsCap: Number(overCap.state.nextSpentSompi) > Number(overCap.state.capSompi),
    localEngineAcceptedGeneratedSigScript: overCap.localChecks.engineAcceptedGeneratedSigScript
  },
  proves: [
    "Two sequential RecurringTreasuryVault.sil spends were accepted on TN12 from the same covenant lineage.",
    "The second accepted spend used the first continuation output as its input state.",
    "The cumulative accepted total is 65 tKAS under the 75 tKAS cap.",
    "A later candidate that would move cumulative spent to 80 tKAS is rejected by the local covenant engine."
  ],
  doesNotProve: [
    "window reset behavior",
    "mainnet activation",
    "wallet-standard user signing",
    "audited custody"
  ],
  sourceArtifacts: {
    firstEvidence: "artifacts/recurring-treasury-vault-live-spend-evidence.json",
    firstContinuation: "fixtures/RecurringTreasuryVaultContinuationOutpoint.json",
    secondDraft: "artifacts/signed-drafts/recurring-treasury-vault-cumulative-spend.json",
    secondEvidence: "artifacts/recurring-treasury-vault-cumulative-spend-evidence.json",
    secondContinuation: "fixtures/RecurringTreasuryVaultCumulativeContinuationOutpoint.json",
    overCap: "artifacts/signed-drafts/recurring-treasury-vault-cumulative-over-cap.json"
  }
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function acceptedSpend(id, evidence) {
  return {
    id,
    status: evidence.status,
    txid: evidence.txid,
    explorerUrl: evidence.explorerUrl,
    acceptedOnTn12: evidence.checks.acceptedOnTn12,
    prevSpentSompi: String(evidence.state.prevSpentSompi),
    spendAmountSompi: String(evidence.state.spendAmountSompi),
    nextSpentSompi: String(evidence.state.nextSpentSompi),
    continuationAmountSompi: evidence.outputs.find((output) => output.index === 1)?.amountSompi || null
  };
}
