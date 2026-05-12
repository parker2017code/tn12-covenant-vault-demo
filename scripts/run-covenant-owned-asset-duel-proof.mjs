import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/covenant_owned_asset_duel_proof.rs";
const outPath = process.env.OUT || "artifacts/covenant-owned-asset-duel-proof.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

await mkdir("artifacts", { recursive: true });

const tmp = await mkdtemp(join(tmpdir(), "tn12-covenant-owned-asset-duel-"));
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));

  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    TN12_REPO_ROOT: repoRoot,
    CARGO_TARGET_DIR: targetDir
  });
  const cases = parseCases(run.stdout);
  const artifact = {
    schema: "tn12-covenant-owned-asset-duel-proof/v1",
    reviewedAt: "2026-05-12",
    status: run.code === 0 ? "local-icc-sibling-proof-passed" : "local-icc-sibling-proof-failed",
    source: "contracts/CovenantOwnedAssetDuel.sil",
    rustHarness: rustSource,
    command: `TN12_REPO_ROOT=${repoRoot} CARGO_TARGET_DIR=${targetDir} cargo run -q --manifest-path ${tmp}/Cargo.toml`,
    pattern: "ICC sibling-input authorization",
    cases,
    proves: [
      "a covenant-owned asset transition can be authorized by a sibling input with the expected covenant_id",
      "wrong witness index is rejected",
      "missing sibling input is rejected",
      "wrong sibling covenant_id is rejected"
    ],
    doesNotProve: [
      "accepted TN12 broadcast",
      "nested execution of another covenant",
      "fungible token standard completeness"
    ],
    stdout: run.stdout.trim(),
    stderr: run.stderr.trim()
  };

  await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(`Wrote ${outPath}`);
  if (run.code !== 0) {
    console.error(run.stdout);
    console.error(run.stderr);
    process.exit(run.code);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}

function cargoToml(root) {
  return `[package]
name = "tn12-covenant-owned-asset-duel-proof"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript-errors = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
`;
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
