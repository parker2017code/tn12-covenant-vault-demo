import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const repoRoot = process.cwd();
const rustSource = "scripts/rust/blitz_mux_arena_proof.rs";
const outPath = process.env.OUT || "artifacts/blitz-mux-arena-proof.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

await mkdir("artifacts", { recursive: true });

const tmp = await mkdtemp(join(tmpdir(), "tn12-blitz-mux-arena-"));
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
    schema: "tn12-blitz-mux-arena-proof/v1",
    reviewedAt: "2026-05-12",
    status: run.code === 0 ? "local-mux-worker-timeout-proof-passed" : "local-mux-worker-timeout-proof-failed",
    sources: ["contracts/BlitzMux.sil", "contracts/BlitzWorkerA.sil", "contracts/BlitzWorkerB.sil"],
    rustHarness: rustSource,
    command: `TN12_REPO_ROOT=${repoRoot} CARGO_TARGET_DIR=${targetDir} cargo run -q --manifest-path ${tmp}/Cargo.toml`,
    pattern: "mux/worker routing with timeout escape",
    cases,
    proves: [
      "mux routes shared state to worker A or B through template identity",
      "worker A and worker B can return updated state to the mux",
      "bad selector is rejected",
      "timeout can recover a pending worker state after the move clock",
      "too-early timeout is rejected"
    ],
    doesNotProve: [
      "accepted TN12 broadcast",
      "full chess rules",
      "production game settlement",
      "mainnet activation"
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
name = "tn12-blitz-mux-arena-proof"
version = "0.1.0"
edition = "2024"

[dependencies]
silverscript-lang = { path = "${root}/silverscript-lang" }
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript-errors = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
blake2b_simd = "1.0.2"
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
