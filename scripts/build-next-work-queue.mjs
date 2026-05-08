import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildNextWorkQueue } from "../src/nextWorkQueue.mjs";

const fixturePath = process.env.NEXT_WORK_QUEUE_FIXTURE || "fixtures/NextWorkQueue.json";
const outPath = process.env.OUT || "artifacts/next-work-queue.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const queue = buildNextWorkQueue(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(queue, null, 2)}\n`);

console.log(outPath);
console.log(`status=${queue.status}`);
console.log(`tasks=${queue.summary.tasks}`);
console.log(`topPriority=${queue.summary.topPriority}`);
