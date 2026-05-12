import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const rustSource = "scripts/rust/recurring_treasury_vault_rust_submit_route_probe.rs";
const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-rust-submit-route-probe.json";
const toolsRoot = process.env.SILVERSCRIPT_TOOLS_ROOT || "/home/parker2017/silverscript-tools";
const targetDir = process.env.CARGO_TARGET_DIR || `${toolsRoot}/target`;

await mkdir("artifacts", { recursive: true });

const tmp = await mkdtemp(join(tmpdir(), "tn12-recurring-vault-rust-submit-route-"));
try {
  await writeFile(join(tmp, "Cargo.toml"), cargoToml(toolsRoot));
  await mkdir(join(tmp, "src"), { recursive: true });
  await writeFile(join(tmp, "src/main.rs"), await readFile(rustSource, "utf8"));

  const run = await runCommand("cargo", ["run", "-q", "--manifest-path", join(tmp, "Cargo.toml")], {
    CARGO_TARGET_DIR: targetDir
  });
  const fields = parseKeyValueLines(run.stdout);
  const artifact = {
    schema: "tn12-recurring-treasury-vault-rust-submit-route-probe/v1",
    reviewedAt: "2026-05-12",
    status: run.code === 0 ? "rust-submit-route-preserves-covenant-binding" : "rust-submit-route-probe-failed",
    rustHarness: rustSource,
    command: `CARGO_TARGET_DIR=${targetDir} cargo run -q --manifest-path ${tmp}/Cargo.toml`,
    proves: [
      "Rust RPC model can carry output covenant binding inside SubmitTransactionRequest",
      "Rust RPC model preserves tx version 1 input computeBudget"
    ],
    doesNotProve: [
      "network broadcast",
      "mempool acceptance",
      "accepted TN12 recurring-vault spend"
    ],
    fields,
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
name = "tn12-recurring-vault-rust-submit-route-probe"
version = "0.1.0"
edition = "2024"

[dependencies]
kaspa-consensus-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-rpc-core = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
kaspa-txscript = { git = "https://github.com/kaspanet/rusty-kaspa", branch = "tn12" }
workflow-serializer = "0.18.0"
`;
}

function parseKeyValueLines(stdout) {
  return Object.fromEntries(stdout
    .split(/\r?\n/)
    .map((line) => line.match(/^([a-z0-9_]+)=(.+)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2]]));
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
