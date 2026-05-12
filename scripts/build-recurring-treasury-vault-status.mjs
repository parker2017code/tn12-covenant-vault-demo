import { readFile, writeFile } from "node:fs/promises";

const compiled = JSON.parse(await readFile("artifacts/RecurringTreasuryVault.json", "utf8"));
const recurringCaps = JSON.parse(await readFile("artifacts/treasury-recurring-caps.json", "utf8"));
const out = {
  schema: "tn12-recurring-treasury-vault-status/v1",
  reviewedAt: "2026-05-12",
  contract: "contracts/RecurringTreasuryVault.sil",
  compiledArtifact: "artifacts/RecurringTreasuryVault.json",
  status: "script-compiled-not-submitted",
  currentEvidence: {
    acceptedWalletPolicyTxid: recurringCaps.positive.txid,
    walletPolicyStatus: recurringCaps.status,
    capWindowStatus: recurringCaps.window.status
  },
  scriptIntendedEnforcement: [
    "owner signature",
    "positive spend amount",
    "amount plus prior window spend cannot exceed cap",
    "continuation state increments spent amount",
    "destination output must match required destination pubkey",
    "remaining value must relock through validateOutputState"
  ],
  negativeCandidates: [
    { id: "wrong-owner-signature", status: "candidate" },
    { id: "wrong-destination", status: "candidate" },
    { id: "over-cap", status: "candidate" },
    { id: "missing-continuation", status: "candidate" },
    { id: "bad-window-state", status: "candidate" }
  ],
  promotionRule: "Do not label recurring caps SCRIPT_ENFORCED until a spend from this compiled contract is accepted on TN12 and the negative map is checked.",
  compiledBytes: JSON.stringify(compiled).length
};

await writeFile("artifacts/recurring-treasury-vault-status.json", `${JSON.stringify(out, null, 2)}\n`);
console.log("artifacts/recurring-treasury-vault-status.json");
console.log(`status=${out.status}`);
