import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAgentSettlementReview } from "../src/agentSettlementReview.mjs";

const settlementDraftsPath = process.env.AGENT_SETTLEMENT_DRAFTS || "artifacts/agent-settlement-drafts.json";
const walletStandardMappingPath = process.env.WALLET_STANDARD_MAPPING || "artifacts/wallet-standard-mapping.json";
const custodySourcesPath = process.env.AGENT_CUSTODY_SOURCES || "fixtures/AgentCustodySources.json";
const outPath = process.env.OUT || "artifacts/agent-settlement-review.json";

const settlementDrafts = JSON.parse(await readFile(settlementDraftsPath, "utf8"));
const walletStandardMapping = JSON.parse(await readFile(walletStandardMappingPath, "utf8"));
const custodySources = JSON.parse(await readFile(custodySourcesPath, "utf8"));
const review = buildAgentSettlementReview({ settlementDrafts, walletStandardMapping, custodySources });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(review, null, 2)}\n`);

console.log(outPath);
console.log(`status=${review.status}`);
console.log(`custodyEvidenceRows=${review.summary.custodyEvidenceRows}`);
console.log(`custodyReadyRows=${review.summary.custodyReadyRows}`);
