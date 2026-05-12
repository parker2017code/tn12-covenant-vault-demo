import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const source = "contracts/probes/RecurringTreasuryDeclProbe.sil";
const output = "artifacts/RecurringTreasuryDeclProbe.json";
const artifact = "artifacts/silverscript-decl-support.json";
const silverc = process.env.SILVERC || "/home/parker2017/silverscript-tools/target/release/silverc";

await mkdir("artifacts", { recursive: true });

const compile = await run(silverc, [source, "-o", output]);
let compiledBytes = 0;
if (compile.code === 0) {
  compiledBytes = Buffer.byteLength(await readFile(output, "utf8"));
}

const result = {
  schema: "tn12-silverscript-decl-support/v1",
  reviewedAt: "2026-05-12",
  source,
  compiler: silverc,
  status: compile.code === 0 ? "decl-covenant-probe-compiled" : "decl-covenant-probe-blocked",
  compiledOutput: compile.code === 0 ? output : null,
  compiledBytes,
  supportedSignals: {
    covenantMacro: compile.code === 0,
    covBinding: compile.code === 0,
    stateArrayParameters: compile.code === 0,
    generatedLeaderDelegateWrappers: compile.code === 0,
    opCovLowering: compile.code === 0
  },
  nextRail: compile.code === 0
    ? "Build RecurringTreasuryVault.sil around explicit cap, spentInWindow, windowStart, required destination, continuation output, and negative candidates."
    : "Record compiler stderr and keep recurring caps labeled wallet-policy until a DECL/manual covenant-state path compiles.",
  stderr: compile.stderr.trim(),
  stdout: compile.stdout.trim()
};

await writeFile(artifact, `${JSON.stringify(result, null, 2)}\n`);
console.log(`${artifact}`);
console.log(`status=${result.status}`);

function run(command, args) {
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
