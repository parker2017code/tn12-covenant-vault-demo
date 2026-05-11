import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { spawnSync } from "node:child_process";

const walletsPath = process.env.PLAYGROUND_WALLETS_PUBLIC || ".local/playground/wallets.public.json";
const outPath = process.env.OUT || ".local/playground/funding-draft.json";
const planPath = process.env.PLAYGROUND_FUNDING_PLAN_OUT || ".local/playground/funding-plan.public.json";
const roles = new Set(String(process.env.PLAYGROUND_FUNDING_ROLES || "")
  .split(",")
  .map((role) => role.trim())
  .filter(Boolean));

const walletsArtifact = JSON.parse(await readFile(walletsPath, "utf8"));
const outputs = (walletsArtifact.wallets || [])
  .filter((wallet) => roles.size === 0 || roles.has(wallet.id))
  .map((wallet) => ({
    label: `playground:${wallet.id}`,
    address: wallet.address,
    xOnlyPublicKey: wallet.xOnlyPublicKey,
    amountTkas: wallet.fundingTargetTkas
  }));

if (outputs.length === 0) {
  throw new Error(`No playground wallet outputs selected from ${walletsPath}.`);
}

for (const output of outputs) {
  if (!output.xOnlyPublicKey) {
    throw new Error(`Playground wallet ${output.label} is missing xOnlyPublicKey. Regenerate wallets with npm run playground:wallets -- --force.`);
  }
}

await mkdir(dirname(planPath), { recursive: true });
await writeFile(planPath, `${JSON.stringify({
  schema: "tn12-playground-funding-plan/v1",
  network: "kaspa-testnet-12",
  source: {
    walletPath: process.env.TN12_WALLET || ".local/tn12-wallet.json",
    fundingOutpointPath: process.env.FUNDING_OUTPOINT || "fixtures/FundedWalletOutpoint.json"
  },
  draftPath: outPath,
  selectedRoles: roles.size === 0 ? "all" : [...roles].sort(),
  outputs: outputs.map(({ xOnlyPublicKey, ...output }) => output)
}, null, 2)}\n`);

const result = spawnSync(process.execPath, ["scripts/build-signed-multi-p2pk-draft.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    OUTPUTS_JSON: JSON.stringify(outputs),
    OUT: outPath
  },
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log(`fundingPlan=${planPath}`);
