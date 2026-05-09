import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildNextTenExecutionPlan } from "../src/nextTenExecutionPlan.mjs";

const queue = JSON.parse(await readFile(process.env.NEXT_WORK_QUEUE || "artifacts/next-work-queue.json", "utf8"));
const walletMapping = JSON.parse(await readFile(process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json", "utf8"));
const livePreflight = JSON.parse(await readFile(process.env.VIRTUAL_CHAIN_PREFLIGHT || "artifacts/virtual-chain-live-preflight.json", "utf8"));
const settlementDecision = JSON.parse(await readFile(process.env.BATCH_SETTLEMENT_DECISION || "artifacts/batch-assurance-settlement-decision.json", "utf8"));
const outPath = process.env.OUT || "artifacts/next-ten-execution-plan.json";

const plan = buildNextTenExecutionPlan({ queue, walletMapping, livePreflight, settlementDecision });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`);

console.log(outPath);
console.log(`status=${plan.status}`);
console.log(`tasks=${plan.summary.tasks}`);
