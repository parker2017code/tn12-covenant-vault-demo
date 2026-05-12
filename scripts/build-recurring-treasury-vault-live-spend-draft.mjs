import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/recurring_treasury_vault_live_spend_draft.rs";
const outPath = process.env.OUT || "artifacts/signed-drafts/recurring-treasury-vault-live-spend.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

const wallet = await readJson(process.env.TN12_WALLET || ".local/tn12-wallet.json");
const contractOutpoint = await readJson(process.env.CONTRACT_OUTPOINT || "fixtures/RecurringTreasuryVaultContractOutpoint.json");
const rpcRoute = await readJson(process.env.RPC_DATA_ROUTE || "artifacts/recurring-treasury-vault-rpc-data-route.json");
const constructorArgs = await readJson(process.env.CONSTRUCTOR_ARGS || "fixtures/RecurringTreasuryVault.ctor.json");

const covenantId = contractOutpoint.covenantId
  || rpcRoute.observed?.fundingOutputCovenant?.covenantId
  || rpcRoute.observed?.wrpcUtxoCovenant?.covenantId;
if (!covenantId) {
  throw new Error("RPC data route does not expose a covenant id. Run npm run covenant:recurring-vault-rpc-data-route first.");
}

const spendAmountSompi = String(process.env.SPEND_AMOUNT_SOMPI || "2500000000");
const computeBudget = String(process.env.COMPUTE_BUDGET || "100");

await mkdir("artifacts/signed-drafts", { recursive: true });

const tmp = await mkdtempCompat("tn12-recurring-vault-live-spend-");
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
    SPEND_AMOUNT_SOMPI: spendAmountSompi,
    COMPUTE_BUDGET: computeBudget,
    CAP_SOMPI: String(constructorArgs[2]?.data ?? "7500000000"),
    WINDOW_START: String(constructorArgs[3]?.data ?? "9899000"),
    PREV_SPENT_SOMPI: String(process.env.PREV_SPENT_SOMPI || (constructorArgs[4]?.data ?? "0")),
    MINER_FEE_SOMPI: String(process.env.MINER_FEE_SOMPI || (constructorArgs[5]?.data ?? "20000"))
  });
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }

  const built = JSON.parse(run.stdout);
  const artifact = {
    schema: "tn12-recurring-treasury-vault-live-spend-draft/v1",
    network: "kaspa-testnet-12",
    status: built.localEngineOk ? "signed-local-engine-passed-not-broadcast" : "blocked-local-engine-failed",
    warning: "Signed TN12 covenant-spend draft. Submit only once; it spends the current RecurringTreasuryVault covenant output.",
    source: {
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
      output0AmountMatchesSpend: String(built.outputs?.[0]?.amount) === spendAmountSompi
    },
    transactionId: built.transactionId,
    submitPayload: {
      transaction: {
        version: 1,
        inputs: [built.input],
        outputs: built.outputs.map(({ nextRedeemScriptHex, ...output }) => output),
        lockTime: 0,
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
name = "tn12-recurring-vault-live-spend-draft"
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
