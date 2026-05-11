import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPlaygroundSession } from "../src/playgroundSession.mjs";

const outPath = process.env.OUT || "artifacts/playground-session.example.json";
const plan = await readJson("artifacts/playground-plan.json");
const session = buildPlaygroundSession({
  plan,
  publicAddresses: {
    operator: "kaspatest:qrtnnhjt8ds6398srxytdn7sjc7585d5pfu8gymxvy32fufwpdsd22432yamt",
    pool: "kaspatest:qqpgfuzxvt7vtud4qv5aklpe5z0kd27j4pw33x33t3ya3ya95ffrymd0gntt4",
    "user-a": "kaspatest:qz2cgcm73ej5l72g9zxkk44rxz4au35fmrg49xdurnr9ca63dzyuu9fn3atvh",
    "user-b": "kaspatest:qz5epzeyjk65xaajf7mt36apk4fa2p52548chz300sr2dx8uqmkfjzvhq0a8v",
    executor: "kaspatest:qqpxcwpdqazxgmgvhj2ntp8mvxwkaetw73g0prq97q2vxfpwg2w3sv3kd5f0z",
    reviewer: "kaspatest:qzcvj4raan9cskly8p9nn7slpke09ztrzw4dmzx5s3ud8rad4f8msvl6juaj9"
  },
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
