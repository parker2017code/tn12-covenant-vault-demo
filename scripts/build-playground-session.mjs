import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPlaygroundSession } from "../src/playgroundSession.mjs";

const outPath = process.env.OUT || "artifacts/playground-session.example.json";
const plan = await readJson("artifacts/playground-plan.json");
const session = buildPlaygroundSession({
  plan,
  publicAddresses: {},
  txids: []
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log(outPath);
console.log(`roles=${session.summary.roles}`);
console.log(`privateKeysIncluded=${session.summary.privateKeysIncluded}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
