import { access, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, join } from "node:path";

const silverc = process.env.SILVERC || "/home/parker2017/silverscript-tools/target/release/silverc";
const contracts = process.argv.slice(2);
const sources = contracts.length
  ? contracts
  : ["contracts/DelayedRecoveryVault.sil", "contracts/AssurancePledge.sil"];

await access(silverc);
await mkdir("artifacts", { recursive: true });

for (const source of sources) {
  const name = basename(source, ".sil");
  const output = join("artifacts", `${name}.json`);
  const ctor = join("fixtures", `${name}.ctor.json`);
  const args = [source, "-o", output];
  if (await exists(ctor)) {
    args.push("--constructor-args", ctor);
  }
  await run(silverc, args);
  console.log(`${source} -> ${output}`);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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
