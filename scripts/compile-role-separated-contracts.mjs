import { access, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, join } from "node:path";

const silverc = process.env.SILVERC || "/home/parker2017/silverscript-tools/target/release/silverc";
const ctorDir = process.env.ROLE_CTOR_DIR || "fixtures/role-separated";
const outDir = process.env.OUT_DIR || "artifacts/role-separated";
const sources = process.argv.slice(2);
const contracts = sources.length
  ? sources
  : ["contracts/DelayedRecoveryVault.sil", "contracts/AssurancePledge.sil", "contracts/Escrow.sil"];

await access(silverc);
await mkdir(outDir, { recursive: true });

for (const source of contracts) {
  const name = basename(source, ".sil");
  const ctor = join(ctorDir, `${name}.ctor.json`);
  const output = join(outDir, `${name}.json`);
  await access(ctor);
  await run(silverc, [source, "-o", output, "--constructor-args", ctor]);
  console.log(`${source} + ${ctor} -> ${output}`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with ${code}`));
      }
    });
  });
}
