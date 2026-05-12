import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const source = "contracts/probes/RecurringTreasuryVaultStateProbe.sil";
const testFile = "fixtures/RecurringTreasuryVaultStateProbe.test.json";
const outPath = process.env.OUT || "artifacts/recurring-treasury-vault-state-proof.json";
const cargoManifest = process.env.SILVERSCRIPT_TOOLS_MANIFEST || "/home/parker2017/silverscript-tools/Cargo.toml";

await mkdir("artifacts", { recursive: true });

const tests = JSON.parse(await readFile(testFile, "utf8")).tests;
const run = await runCommand("cargo", [
  "run",
  "-q",
  "--manifest-path",
  cargoManifest,
  "-p",
  "cli-debugger",
  "--",
  source,
  "--run-all",
  "--test-file",
  testFile
]);

const artifact = {
  schema: "tn12-recurring-treasury-vault-state-proof/v1",
  reviewedAt: "2026-05-12",
  status: run.code === 0 ? "local-state-transition-proof-passed" : "local-state-transition-proof-failed",
  source,
  testFile,
  command: `cargo run -q --manifest-path ${cargoManifest} -p cli-debugger -- ${source} --run-all --test-file ${testFile}`,
  cases: tests.map((test) => ({
    name: test.name,
    expected: test.expect,
    status: run.stdout.includes(`PASS  ${test.name}`) ? "passed" : "not-passed"
  })),
  proves: [
    "under-cap spend can preserve destination and relocked continuation state",
    "over-cap spend is rejected",
    "wrong destination is rejected",
    "missing continuation is rejected"
  ],
  doesNotProve: [
    "ownerSig path on the full RecurringTreasuryVault.sil",
    "accepted TN12 spend from the funded contract output",
    "JS submit support for covenant-bound continuation outputs"
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

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
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
