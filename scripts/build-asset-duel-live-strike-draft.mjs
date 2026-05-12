import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/asset_duel_live_strike_draft.rs";
const outPath = process.env.OUT || "artifacts/signed-drafts/covenant-owned-asset-duel-live-strike.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;
const assetOutpoint = await readJson(process.env.ASSET_OUTPOINT || "fixtures/CovenantOwnedAssetDuelLiveContractOutpoint.json");
const assetGenesisDraft = await readJson(process.env.ASSET_GENESIS_DRAFT || "artifacts/signed-drafts/covenant-owned-asset-duel-live-genesis-funding.json");
const ownerOutpoint = await readJson(process.env.OWNER_OUTPOINT || "fixtures/AssetDuelOwnerMarkerOutpoint.json");
const wallet = await readJson(process.env.TN12_WALLET || ".local/tn12-wallet.json");
const assetCovenantId = assetOutpoint.covenantId || assetGenesisDraft.covenantGenesis?.covenant?.covenantId;

if (!assetCovenantId) throw new Error("Asset Duel live contract outpoint is missing covenantId.");
if (!ownerOutpoint.covenantId) throw new Error("Owner marker outpoint is missing covenantId.");
if (!ownerOutpoint.raw?.utxoEntry?.scriptPublicKey?.scriptPublicKey) {
  throw new Error("Owner marker outpoint is missing scriptPublicKey.");
}

await mkdir("artifacts/signed-drafts", { recursive: true });
const tmp = await mkdtempCompat("tn12-asset-duel-live-strike-");
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));
  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir,
    OWNER_PRIVATE_KEY: wallet.privateKey,
    ASSET_TXID: assetOutpoint.txid,
    ASSET_INDEX: String(assetOutpoint.outputIndex),
    ASSET_VALUE_SOMPI: String(assetOutpoint.amountSompi),
    ASSET_COVENANT_ID: assetCovenantId,
    OWNER_TXID: ownerOutpoint.txid,
    OWNER_INDEX: String(ownerOutpoint.outputIndex),
    OWNER_VALUE_SOMPI: String(ownerOutpoint.amountSompi),
    OWNER_COVENANT_ID: ownerOutpoint.covenantId,
    OWNER_SCRIPT_PUBLIC_KEY: ownerOutpoint.raw.utxoEntry.scriptPublicKey.scriptPublicKey,
    COMPUTE_BUDGET: String(process.env.COMPUTE_BUDGET || "60"),
    OWNER_COMPUTE_BUDGET: String(process.env.OWNER_COMPUTE_BUDGET || "10"),
    MINER_FEE_SOMPI: String(process.env.MINER_FEE_SOMPI || "20000"),
    INITIAL_POWER: String(process.env.INITIAL_POWER || "600"),
    SPEND_POWER: String(process.env.SPEND_POWER || "150")
  });
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }
  const built = JSON.parse(run.stdout);
  const artifact = {
    schema: "tn12-covenant-owned-asset-duel-live-strike-draft/v1",
    network: "kaspa-testnet-12",
    status: built.localEngineOk ? "signed-local-engine-passed-not-broadcast" : "blocked-local-engine-failed",
    source: {
      assetOutpoint: {
        txid: assetOutpoint.txid,
        outputIndex: assetOutpoint.outputIndex,
        amountSompi: String(assetOutpoint.amountSompi),
        amountTkas: assetOutpoint.amountTkas,
        covenantId: assetCovenantId
      },
      ownerMarkerOutpoint: {
        txid: ownerOutpoint.txid,
        outputIndex: ownerOutpoint.outputIndex,
        amountSompi: String(ownerOutpoint.amountSompi),
        amountTkas: ownerOutpoint.amountTkas,
        covenantId: ownerOutpoint.covenantId
      }
    },
    pattern: {
      name: "ICC sibling-input authorization",
      rule: "Asset Duel strike is valid only when input 1 carries the configured owner covenant id.",
      nestedExecution: false
    },
    localChecks: {
      engineAcceptedGeneratedSigScript: built.localEngineOk,
      assetContractAccepted: built.assetEngineOk,
      ownerMarkerP2pkAccepted: built.ownerMarkerEngineOk,
      output0CovenantMatchesAssetInput: built.outputs?.[0]?.covenant?.covenantId === assetCovenantId,
      ownerMarkerInputPresent: built.inputs?.[1]?.previousOutpoint?.transactionId === ownerOutpoint.txid
    },
    transactionId: built.transactionId,
    submitPayload: {
      transaction: {
        version: 1,
        inputs: built.inputs,
        outputs: built.outputs.map(({ nextRedeemScriptHex, ...output }) => output),
        lockTime: 0,
        subnetworkId: "0000000000000000000000000000000000000000"
      },
      allowOrphan: false
    },
    scriptEvidence: built.scriptEvidence,
    state: built.state,
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

async function readJson(path) { return JSON.parse(await readFile(path, "utf8")); }
async function mkdtempCompat(prefix) {
  const { mkdtemp } = await import("node:fs/promises");
  return mkdtemp(join(tmpdir(), prefix));
}
function cargoToml(root) {
  return `[package]
name = "tn12-asset-duel-live-strike-draft"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
secp256k1 = { version = "0.29", features = ["rand-std"] }
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
    child.on("error", (error) => resolve({ code: 127, stdout, stderr: `${stderr}${error.message}` }));
    child.on("exit", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}
