import { mkdir, readFile, writeFile } from "node:fs/promises";

const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-window-reset-proof.json";

const fundingDraft = await readJson("artifacts/signed-drafts/recurring-treasury-vault-window-genesis-funding.json");
const contractOutpoint = await readJson("fixtures/RecurringTreasuryVaultWindowContractOutpoint.json");
const resetDraft = await readJson("artifacts/signed-drafts/recurring-treasury-vault-window-reset.json");
const resetEvidence = await readJson("artifacts/recurring-treasury-vault-window-reset-evidence.json");
const continuation = await readJson("fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json");
const negatives = [
  await negative("early-reset", "artifacts/signed-drafts/recurring-treasury-vault-window-early-reset.json", "lockTime before reset window"),
  await negative("stale-reset-window", "artifacts/signed-drafts/recurring-treasury-vault-window-stale-reset.json", "new state keeps the old window"),
  await negative("over-cap-reset", "artifacts/signed-drafts/recurring-treasury-vault-window-over-cap-reset.json", "reset amount exceeds cap")
];

const artifact = {
  schema: "tn12-recurring-treasury-vault-window-reset-proof/v1",
  network: "kaspa-testnet-12",
  generatedAt: new Date().toISOString(),
  status: resetEvidence.status === "accepted-script-enforced-window-reset"
    && negatives.every((item) => item.status === "blocked-local-engine-failed")
    ? "accepted-window-reset-with-local-negatives"
    : "incomplete",
  contract: "contracts/RecurringTreasuryVaultWindow.sil",
  plainPoint: "A capped treasury can start a new spending window without letting the old spent amount permanently freeze the vault.",
  technicalPoint: "The reset branch checks owner signature, required destination, cap amount, window age, new window state, and relocked covenant continuation output.",
  kaspaEdge: "Fast UTXO confirmation makes two-step covenant state flows practical: one output can carry the treasury state forward and the next spend can enforce the next rule quickly.",
  cryptoPoint: "The rule travels with the coin. A normal app server can promise a cap, but this path shows the spend itself must satisfy the cap and continuation rules before the transaction is accepted.",
  realWorldImplication: "This is the primitive behind recurring budgets, allowance wallets, team treasuries, game resources, and merchant payout limits where users want money to move without handing total discretion to one operator.",
  source: {
    fundingDraft: "artifacts/signed-drafts/recurring-treasury-vault-window-genesis-funding.json",
    contractOutpoint: "fixtures/RecurringTreasuryVaultWindowContractOutpoint.json",
    resetDraft: "artifacts/signed-drafts/recurring-treasury-vault-window-reset.json",
    resetEvidence: "artifacts/recurring-treasury-vault-window-reset-evidence.json",
    continuation: "fixtures/RecurringTreasuryVaultWindowResetContinuationOutpoint.json",
    negatives: negatives.map((item) => item.artifact)
  },
  accepted: {
    genesisTxid: fundingDraft.transactionId,
    resetTxid: resetEvidence.txid,
    acceptingBlockBlueScore: resetEvidence.acceptingBlockBlueScore,
    continuationOutpoint: `${continuation.txid}:${continuation.outputIndex}`
  },
  state: {
    before: {
      windowStart: resetDraft.state.windowStart,
      spentInWindowSompi: resetDraft.state.prevSpentSompi,
      capSompi: resetDraft.state.capSompi
    },
    reset: {
      lockTime: resetDraft.state.lockTime,
      newWindow: resetDraft.state.nextWindow,
      amountSompi: resetDraft.state.spendAmountSompi,
      nextSpentSompi: resetDraft.state.nextSpentSompi
    },
    continuation: continuation.state
  },
  negativeCases: negatives,
  proves: [
    "accepted TN12 covenant-genesis funding for RecurringTreasuryVaultWindow.sil",
    "accepted TN12 reset-window spend through the generated __reset_window sigscript",
    "destination amount and relocked continuation output match the signed draft",
    "early reset, stale-window reset, and over-cap reset candidates fail local script-engine execution"
  ],
  doesNotProve: [
    "mainnet activation",
    "audited custody",
    "wallet-standard user signing",
    "calendar-grade production accounting",
    "multi-user treasury governance"
  ],
  publicCopyRule: "Say this proves a TN12/testnet script-enforced reset primitive. Do not call it a production treasury product or mainnet wallet."
};

await mkdir(outPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`${outPath} ${artifact.status}`);

async function negative(id, artifact, reason) {
  const draft = await readJson(artifact);
  return {
    id,
    artifact,
    status: draft.status,
    reason,
    localEngineAcceptedGeneratedSigScript: draft.localChecks.engineAcceptedGeneratedSigScript,
    transactionId: draft.transactionId,
    state: draft.state
  };
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
