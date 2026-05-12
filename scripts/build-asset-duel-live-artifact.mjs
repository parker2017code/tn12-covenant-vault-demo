import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const silverc = process.env.SILVERC || "/home/parker2017/silverscript-tools/target/release/silverc";
const ownerMarker = JSON.parse(await readFile(process.env.OWNER_MARKER || "fixtures/AssetDuelOwnerMarkerOutpoint.json", "utf8"));
const fixturePath = process.env.FIXTURE || "fixtures/CovenantOwnedAssetDuelLive.ctor.json";
const outPath = process.env.OUT || "artifacts/CovenantOwnedAssetDuelLive.json";

await mkdir("fixtures", { recursive: true });
await mkdir("artifacts", { recursive: true });
await writeFile(fixturePath, `${JSON.stringify([
  byteArrayArg(hexToBytes(ownerMarker.covenantId)),
  { kind: "int", data: 600 }
], null, 2)}\n`);
await run(silverc, ["contracts/CovenantOwnedAssetDuel.sil", "-o", outPath, "--constructor-args", fixturePath]);
await writeFile("artifacts/covenant-owned-asset-duel-live-artifact.json", `${JSON.stringify({
  schema: "tn12-covenant-owned-asset-duel-live-artifact/v1",
  network: "kaspa-testnet-12",
  status: "live-owner-covenant-artifact-built",
  ownerMarker: "fixtures/AssetDuelOwnerMarkerOutpoint.json",
  ownerCovenantId: ownerMarker.covenantId,
  fixture: fixturePath,
  artifact: outPath
}, null, 2)}\n`);
console.log("artifacts/covenant-owned-asset-duel-live-artifact.json live-owner-covenant-artifact-built");

function hexToBytes(value) {
  return value.match(/../g).map((chunk) => Number.parseInt(chunk, 16));
}
function byteArrayArg(bytes) {
  return { kind: "array", data: bytes.map((byte) => ({ kind: "byte", data: byte })) };
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
  });
}
