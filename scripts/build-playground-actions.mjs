import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPlaygroundActions } from "../src/playgroundActions.mjs";

const outPath = process.env.OUT || "artifacts/playground-actions.json";
const actions = buildPlaygroundActions({
  plan: await readJson("artifacts/playground-plan.json"),
  session: await readJson("artifacts/playground-session.example.json"),
  reducer: await readJson("artifacts/defi-scenario-reducer.json")
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(actions, null, 2)}\n`);
console.log(outPath);
console.log(`actions=${actions.summary.actions}`);
console.log(`readyActions=${actions.summary.readyActions}`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
