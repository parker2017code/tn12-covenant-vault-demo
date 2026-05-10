import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildTreasuryConstrainedSpends } from "../src/treasuryConstrainedSpends.mjs";
import { buildTreasuryVaultRegistry } from "../src/treasuryVault.mjs";

const fixturePath = process.env.TREASURY_FIXTURE || "fixtures/TreasuryVaults.json";
const outPath = process.env.OUT || "artifacts/treasury-spend-caps.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));

const baselineRegistry = buildTreasuryVaultRegistry(fixture);
const baselineDrafts = buildTreasuryConstrainedSpends({ treasuryRegistry: baselineRegistry });

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

const invalidRecoveryRegistry = buildTreasuryVaultRegistry({
  ...fixture,
  vaults: fixture.vaults.map((vault) => vault.vaultId === "treasury-grants-round"
    ? { ...vault, recoveryAddress: "invalid-recovery-address" }
    : vault)
});

const artifact = {
  schema: "tn12-treasury-spend-caps/v1",
  network: fixture.network || "kaspa-testnet-12",
  status: "treasury-spend-caps-ready",
  summary: {
    vaults: baselineRegistry.summary.total,
    drafts: baselineDrafts.summary.drafts,
    payrollDrafts: baselineDrafts.summary.payrollDrafts,
    delayedWithdrawalDrafts: baselineDrafts.summary.delayedWithdrawalDrafts,
    blockedDrafts: baselineDrafts.summary.blockedDrafts
  },
  scenarios: [
    {
      label: "baseline",
      coreTeam: baselineRegistry.vaults.find((vault) => vault.vaultId === "treasury-core-team")?.checks || {},
      grantsRound: baselineRegistry.vaults.find((vault) => vault.vaultId === "treasury-grants-round")?.checks || {}
    },
    {
      label: "over-cap-payroll",
      draftStatus: overCapDrafts.drafts.find((draft) => draft.id === "treasury-core-team:payroll:payroll-dev-001")?.status || "",
      withinDailyCap: overCapDrafts.drafts.find((draft) => draft.id === "treasury-core-team:payroll:payroll-dev-001")?.checks.withinDailyCap || false,
      withinBalance: overCapDrafts.drafts.find((draft) => draft.id === "treasury-core-team:payroll:payroll-dev-001")?.checks.withinBalance || false
    },
    {
      label: "invalid-recovery-address",
      recoveryAddressValidShape: invalidRecoveryRegistry.vaults.find((vault) => vault.vaultId === "treasury-grants-round")?.checks.recoveryAddressValidShape || false
    }
  ],
  boundaries: [
    "Treasury payroll and spend caps are wallet-policy/planner state.",
    "The current TN12 proof core covers delayed withdrawal and recovery primitives only.",
    "Role labels are review labels, not multisig or governance enforcement."
  ]
};

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);

console.log(outPath);
console.log(`status=${artifact.status}`);
console.log(`drafts=${artifact.summary.drafts}`);
console.log(`blockedDrafts=${artifact.summary.blockedDrafts}`);
