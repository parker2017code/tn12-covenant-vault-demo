import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/recurring_treasury_vault_window_draft.rs";
const mode = process.env.MODE || "reset";
const lane = process.env.LANE || `recurring-treasury-vault-window-${mode}`;
const outPath = process.env.OUT || `artifacts/signed-drafts/${lane}.json`;
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

const wallet = await readJson(process.env.TN12_WALLET || ".local/tn12-wallet.json");
const contractOutpoint = await readJson(process.env.CONTRACT_OUTPOINT || "fixtures/RecurringTreasuryVaultWindowContractOutpoint.json");
const constructorArgs = await readJson(process.env.CONSTRUCTOR_ARGS || "fixtures/RecurringTreasuryVaultWindow.ctor.json");
const covenantId = process.env.COVENANT_ID || contractOutpoint.covenantId;
if (!covenantId) {
  throw new Error("RecurringTreasuryVaultWindow contract outpoint does not expose a covenant id.");
}

const spendAmountSompi = String(process.env.SPEND_AMOUNT_SOMPI || "4000000000");
const computeBudget = String(process.env.COMPUTE_BUDGET || "120");
const capSompi = String(process.env.CAP_SOMPI || (constructorArgs[2]?.data ?? "7500000000"));
const windowStart = String(process.env.WINDOW_START || (constructorArgs[3]?.data ?? "9899000"));
const prevSpentSompi = String(process.env.PREV_SPENT_SOMPI || (constructorArgs[4]?.data ?? "6500000000"));
const windowLength = String(process.env.WINDOW_LENGTH || (constructorArgs[5]?.data ?? "1000"));
const minerFeeSompi = String(process.env.MINER_FEE_SOMPI || (constructorArgs[6]?.data ?? "20000"));
const resetWindow = String(process.env.RESET_WINDOW || Number(windowStart) + Number(windowLength));
const lockTime = String(process.env.LOCK_TIME || resetWindow);
const nextWindow = process.env.NEXT_WINDOW || "";

await mkdir("artifacts/signed-drafts", { recursive: true });

const tmp = await mkdtempCompat("tn12-recurring-vault-window-");
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));

  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir,
    OWNER_PRIVATE_KEY: wallet.privateKey,
    INPUT_TXID: contractOutpoint.txid,
    INPUT_INDEX: String(contractOutpoint.outputIndex),
    INPUT_VALUE_SOMPI: String(contractOutpoint.amountSompi),
    COVENANT_ID: covenantId,
    MODE: mode,
    SPEND_AMOUNT_SOMPI: spendAmountSompi,
    COMPUTE_BUDGET: computeBudget,
    CAP_SOMPI: capSompi,
    WINDOW_START: windowStart,
    PREV_SPENT_SOMPI: prevSpentSompi,
    WINDOW_LENGTH: windowLength,
    MINER_FEE_SOMPI: minerFeeSompi,
    RESET_WINDOW: resetWindow,
    LOCK_TIME: lockTime,
    ...(nextWindow ? { NEXT_WINDOW: nextWindow } : {})
  });
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }

  const built = JSON.parse(run.stdout);
  const artifact = {
    schema: "tn12-recurring-treasury-vault-window-draft/v1",
    network: "kaspa-testnet-12",
    lane,
    mode,
    status: built.localEngineOk ? "signed-local-engine-passed-not-broadcast" : "blocked-local-engine-failed",
    warning: "Signed TN12 covenant-spend draft. Submit only once; it spends the selected RecurringTreasuryVaultWindow covenant output.",
    source: {
      contract: "contracts/RecurringTreasuryVaultWindow.sil",
      contractOutpoint: {
        txid: contractOutpoint.txid,
        outputIndex: contractOutpoint.outputIndex,
        amountSompi: String(contractOutpoint.amountSompi),
        amountTkas: contractOutpoint.amountTkas
      },
      covenantId
    },
    state: built.state,
    localChecks: {
      engineAcceptedGeneratedSigScript: built.localEngineOk,
      inputCovenantIdKnown: Boolean(covenantId),
      output1ContinuationCovenantMatchesInput: built.outputs?.[1]?.covenant?.covenantId === covenantId,
      output0AmountMatchesSpend: String(built.outputs?.[0]?.amount) === spendAmountSompi,
      resetWindowAdvanced: Number(built.state.nextWindow) >= Number(built.state.windowStart) + Number(built.state.windowLength),
      lockTimeCoversResetWindow: Number(built.state.lockTime) >= Number(built.state.nextWindow)
    },
    transactionId: built.transactionId,
    submitPayload: {
      transaction: {
        version: 1,
        inputs: [built.input],
        outputs: built.outputs.map(({ nextRedeemScriptHex, ...output }) => output),
        lockTime: built.state.lockTime,
        subnetworkId: "0000000000000000000000000000000000000000"
      },
      allowOrphan: false
    },
    scriptEvidence: {
      rustHarness: rustSource,
      inputRedeemScriptHex: built.inputRedeemScriptHex,
      nextRedeemScriptHex: built.outputs?.[1]?.nextRedeemScriptHex || null
    },
    submit: {
      dryRunCommand: `node scripts/submit-signed-draft-wrpc.mjs ${outPath}`,
      probeCommand: `KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210 KASPA_WRPC_ENCODING=borsh KASPA_WRPC_NETWORK_ID=testnet-12 node scripts/submit-signed-draft-wrpc.mjs ${outPath} --probe`,
      submitCommand: `KASPA_WASM_MODULE=/home/parker2017/kaspa-node/rusty-kaspa-tn12-inspect/wasm/nodejs/kaspa KASPA_WRPC_URL=ws://tn12-node.kaspa.com:17210 KASPA_WRPC_ENCODING=borsh KASPA_WRPC_NETWORK_ID=testnet-12 node scripts/submit-signed-draft-wrpc.mjs ${outPath} --submit`
    }
  };

  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(`${outPath} ${artifact.status}`);
  console.log(`transactionId=${artifact.transactionId}`);
} finally {
  await rm(tmp, { recursive: true, force: true });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function mkdtempCompat(prefix) {
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp(join(tmpdir(), prefix));
}

function cargoToml(root) {
  return `[package]
name = "tn12-recurring-vault-window-draft"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
secp256k1 = { version = "0.29.0", features = ["global-context", "rand-std", "serde"] }
serde_json = "1.0"
`;
}

function runCommand(command, args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on("exit", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}
