import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/scheduler_covenant_payout_negatives.rs";
const outPath = process.env.OUT || "artifacts/scheduler-covenant-payout-negative-evidence.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

const [operatorWallet, usersPublic, ctor, contractOutpoint, payoutEvidence] = await Promise.all([
  readJson(process.env.TN12_WALLET || ".local/tn12-wallet.json"),
  readJson(process.env.DEFI_USERS_PUBLIC || "fixtures/DefiLocalUserWallets.public.json"),
  readJson(process.env.CONSTRUCTOR_ARGS || "fixtures/SchedulerCovenantPayout.ctor.json"),
  readJson(process.env.CONTRACT_OUTPOINT || "fixtures/SchedulerCovenantPayoutOutpoint.json"),
  readJson(process.env.SCHEDULER_PAYOUT_EVIDENCE || "artifacts/scheduler-covenant-payout-evidence.json")
]);

const operatorXOnly = argBytesToHex(ctor[0]);
const recipientXOnly = argBytesToHex(ctor[1]);
const payoutSompi = String(ctor[2]?.data || "400000000");
const minerFeeSompi = String(ctor[3]?.data || "5000");
const wrongRecipient = (usersPublic.users || usersPublic.wallets || [])
  .find((row) => row.xOnlyPublicKey && row.xOnlyPublicKey !== recipientXOnly);

if (!wrongRecipient) {
  throw new Error("No alternate public recipient found for scheduler negative candidate.");
}

await mkdir("artifacts", { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), "tn12-scheduler-payout-negatives-"));
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));

  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir,
    OPERATOR_PRIVATE_KEY: operatorWallet.privateKey,
    OPERATOR_XONLY: operatorXOnly,
    RECIPIENT_XONLY: recipientXOnly,
    WRONG_RECIPIENT_XONLY: wrongRecipient.xOnlyPublicKey,
    INPUT_TXID: contractOutpoint.txid,
    INPUT_INDEX: String(contractOutpoint.outputIndex),
    COVENANT_ID: contractOutpoint.covenantId,
    PAYOUT_SOMPI: payoutSompi,
    MINER_FEE_SOMPI: minerFeeSompi
  });

  let parsed = {};
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    parsed = { cases: [] };
  }

  const rows = Array.isArray(parsed.cases) ? parsed.cases : [];
  const compactRows = rows.map(({ signatureScriptHex, ...row }) => row);
  const positive = rows.find((row) => row.id === "valid_scheduler_payout_passes");
  const negatives = rows.filter((row) => row.expected === false);
  const ok = run.code === 0
    && positive?.got === true
    && negatives.length >= 3
    && negatives.every((row) => row.status === "passed" && row.got === false);

  const artifact = {
    schema: "tn12-scheduler-covenant-payout-negative-evidence/v1",
    network: "kaspa-testnet-12",
    checkedAt: new Date().toISOString(),
    status: ok ? "local-payout-negative-candidates-passed" : "local-payout-negative-candidates-failed",
    acceptedPositivePath: {
      funding: payoutEvidence.funding,
      release: payoutEvidence.release
    },
    summary: {
      liveProductClaims: 0,
      custodyActions: 0,
      totalCases: compactRows.length,
      localRejects: compactRows.filter((row) => row.expected === false && row.got === false).length
    },
    candidateScope: "Local script-engine candidates using the same live scheduler payout covenant id and contract parameters as the accepted payout path. These rows were not broadcast.",
    cases: compactRows,
    proves: [
      "the valid scheduler payout shape passes local script execution",
      "wrong recipient output is rejected",
      "wrong payout amount is rejected",
      "wrong input value is rejected"
    ],
    doesNotProve: [
      "TN12 rejected-mempool records for the negative candidates",
      "protocol scheduler eligibility",
      "wallet-standard signing",
      "mainnet readiness"
    ],
    sourceArtifacts: {
      acceptedPayoutEvidence: "artifacts/scheduler-covenant-payout-evidence.json",
      contractOutpoint: "fixtures/SchedulerCovenantPayoutOutpoint.json",
      constructorArgs: "fixtures/SchedulerCovenantPayout.ctor.json",
      rustHarness: rustSource
    },
    debug: ok ? null : {
      stdout: run.stdout.trim(),
      stderr: run.stderr.trim()
    }
  };

  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(`${outPath} ${artifact.status}`);
  if (!ok) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(1);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function argBytesToHex(arg) {
  const bytes = arg?.data || [];
  const hex = bytes.map((item) => Number(item.data).toString(16).padStart(2, "0")).join("");
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("Expected 32-byte constructor public key.");
  }
  return hex;
}

function cargoToml(root) {
  return `[package]
name = "tn12-scheduler-payout-negatives"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
secp256k1 = { version = "0.30", features = ["global-context", "rand", "hashes"] }
serde_json = "1"
`;
}

function runCommand(command, args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` }));
    child.on("exit", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}
