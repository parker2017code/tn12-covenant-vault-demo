import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/covenant_owned_asset_duel_proof.rs";
const outPath = process.env.OUT || "artifacts/covenant-owned-asset-duel-live-negative-evidence.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

const liveEvidence = await readJson("artifacts/covenant-owned-asset-duel-live-strike-evidence.json");
const acceptedOwner = liveEvidence.acceptedFlow.find((item) => item.step === "owner-marker-genesis");
const acceptedAsset = liveEvidence.acceptedFlow.find((item) => item.step === "asset-duel-genesis");
const acceptedStrike = liveEvidence.acceptedFlow.find((item) => item.step === "sibling-authorized-strike");
if (!acceptedOwner?.covenantId || !acceptedAsset?.covenantId) {
  throw new Error("Live Asset Duel evidence is missing covenant ids.");
}

await mkdir("artifacts", { recursive: true });
const tmp = await mkdtemp(join(tmpdir(), "tn12-asset-duel-live-negatives-"));
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));
  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir,
    ASSET_COVENANT_ID: acceptedAsset.covenantId,
    OWNER_COVENANT_ID: acceptedOwner.covenantId,
    WRONG_COVENANT_ID: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
  });
  const cases = parseCases(run.stdout);
  const artifact = {
    schema: "tn12-covenant-owned-asset-duel-live-negative-evidence/v1",
    network: "kaspa-testnet-12",
    checkedAt: new Date().toISOString(),
    status: run.code === 0 ? "local-live-id-negative-candidates-passed" : "local-live-id-negative-candidates-failed",
    acceptedPositivePath: {
      ownerMarker: acceptedOwner,
      assetGenesis: acceptedAsset,
      siblingAuthorizedStrike: acceptedStrike
    },
    candidateScope: "Local script-engine candidates using the same live owner and asset covenant ids as the accepted strike path. These rows were not broadcast.",
    cases,
    proves: [
      "the live owner covenant id authorizes the local strike candidate",
      "wrong witness index is rejected",
      "missing sibling input is rejected",
      "wrong sibling covenant id is rejected"
    ],
    doesNotProve: [
      "TN12 rejected-mempool records for the negative candidates",
      "nested covenant execution",
      "production asset standard",
      "user-wallet signing"
    ],
    sourceArtifacts: {
      liveStrikeEvidence: "artifacts/covenant-owned-asset-duel-live-strike-evidence.json",
      rustHarness: rustSource
    },
    stdout: run.stdout.trim(),
    stderr: run.stderr.trim()
  };
  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(`${outPath} ${artifact.status}`);
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function parseCases(stdout) {
  return stdout
    .split(/\r?\n/)
    .map((line) => line.match(/^([a-z0-9_]+) got=(true|false) expected=(true|false)$/))
    .filter(Boolean)
    .map((match) => ({
      name: match[1],
      got: match[2] === "true",
      expected: match[3] === "true",
      status: match[2] === match[3] ? "passed" : "failed"
    }));
}

function cargoToml(root) {
  return `[package]
name = "tn12-asset-duel-live-negatives"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
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
