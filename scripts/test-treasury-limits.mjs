import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryConstrainedSpends } from "../src/treasuryConstrainedSpends.mjs";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";

const fixture = JSON.parse(await readFile("fixtures/TreasuryVaults.json", "utf8"));

const overCapRegistry = buildTreasuryVaultRegistry({
  ...fixture,
  vaults: fixture.vaults.map((vault) => vault.vaultId === "treasury-core-team"
    ? {
        ...vault,
        payroll: vault.payroll.map((payment) => payment.paymentId === "payroll-dev-001"
          ? { ...payment, amountTkas: 100 }
          : payment)
      }
    : vault)
});
const overCapDrafts = buildTreasuryConstrainedSpends({ treasuryRegistry: overCapRegistry });
const overCapPayrollDraft = overCapDrafts.drafts.find((draft) => draft.id === "treasury-core-team:payroll:payroll-dev-001");
assert.equal(overCapPayrollDraft.status, "blocked-policy-check");
assert.equal(overCapPayrollDraft.checks.withinDailyCap, false);
assert.equal(overCapPayrollDraft.checks.withinBalance, true);

const invalidRecoveryRegistry = buildTreasuryVaultRegistry({
  ...fixture,
  vaults: fixture.vaults.map((vault) => vault.vaultId === "treasury-grants-round"
    ? { ...vault, recoveryAddress: "invalid-recovery-address" }
    : vault)
});
const invalidRecoveryVault = invalidRecoveryRegistry.vaults.find((vault) => vault.vaultId === "treasury-grants-round");
assert.equal(invalidRecoveryVault.checks.recoveryAddressValidShape, false);

const artifact = {
  schema: "tn12-treasury-negative-cases/v1",
  status: "treasury-negative-cases-ready",
  cases: [
    { id: "over-cap-payroll", observed: overCapPayrollDraft.status, expected: "blocked-policy-check" },
    { id: "invalid-recovery-address", observed: invalidRecoveryVault.checks.recoveryAddressValidShape, expected: false }
  ]
};

await mkdir("artifacts", { recursive: true });
await writeFile("artifacts/treasury-negative-cases.json", `${JSON.stringify(artifact, null, 2)}\n`);
console.log("artifacts/treasury-negative-cases.json");
console.log(`status=${artifact.status}`);
