import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/blitz_mux_route_draft.rs";
const outPath = process.env.OUT || "artifacts/signed-drafts/blitz-mux-route-to-worker-a.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

const contractOutpoint = await readJson(process.env.CONTRACT_OUTPOINT || "fixtures/BlitzMuxFamilyContractOutpoint.json");
const genesisDraft = await readJson(process.env.GENESIS_DRAFT || "artifacts/signed-drafts/blitz-mux-family-genesis-funding.json");
const covenantId = contractOutpoint.covenantId || genesisDraft.covenantGenesis?.covenant?.covenantId;
if (!covenantId) {
  throw new Error("Missing Blitz Mux family covenant id.");
}

await mkdir("artifacts/signed-drafts", { recursive: true });
const tmp = await mkdtempCompat("tn12-blitz-mux-route-");
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));

  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir,
    INPUT_TXID: contractOutpoint.txid,
    INPUT_INDEX: String(contractOutpoint.outputIndex),
    INPUT_VALUE_SOMPI: String(contractOutpoint.amountSompi),
    COVENANT_ID: covenantId,
    COMPUTE_BUDGET: String(process.env.COMPUTE_BUDGET || "30"),
    MINER_FEE_SOMPI: String(process.env.MINER_FEE_SOMPI || "20000")
  });
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }

  const built = JSON.parse(run.stdout);
  const artifact = {
    schema: "tn12-blitz-mux-route-draft/v1",
    network: "kaspa-testnet-12",
    status: built.localEngineOk ? "signed-local-engine-passed-not-broadcast" : "blocked-local-engine-failed",
    source: {
      contractOutpoint: {
        txid: contractOutpoint.txid,
        outputIndex: contractOutpoint.outputIndex,
        amountSompi: String(contractOutpoint.amountSompi),
        amountTkas: contractOutpoint.amountTkas
      },
      covenantId
    },
    route: {
      from: "BlitzMux",
      to: "BlitzWorkerA",
      selector: 0,
      state: built.state,
      templates: built.templates
    },
    localChecks: {
      engineAcceptedGeneratedSigScript: built.localEngineOk,
      output0CovenantMatchesInput: built.outputs?.[0]?.covenant?.covenantId === covenantId,
      output0WorkerScriptPresent: Boolean(built.outputs?.[0]?.nextRedeemScriptHex)
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
      nextRedeemScriptHex: built.outputs?.[0]?.nextRedeemScriptHex || null
    },
    submit: {
      dryRunCommand: `node scripts/submit-signed-draft-wrpc.mjs ${outPath}`,
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
name = "tn12-blitz-mux-route-draft"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
blake2b_simd = "1.0.2"
serde_json = "1.0"
`;
}

function runCommand(command, args, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, ...env } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on("exit", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}
