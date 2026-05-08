import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAgentCommitmentBoard } from "../src/agentCommitments.mjs";
import { buildAgentSettlementDrafts } from "../src/agentSettlementDrafts.mjs";

const fixturePath = process.env.AGENT_FIXTURE || "fixtures/AgentCommitments.json";
const walletRequestsPath = process.env.WALLET_CONNECTOR_REQUESTS || "artifacts/wallet-connector-submit-requests.json";
const outPath = process.env.OUT || "artifacts/agent-settlement-drafts.json";

const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const walletConnectorRequests = JSON.parse(await readFile(walletRequestsPath, "utf8"));
const agentBoard = buildAgentCommitmentBoard(fixture);
const drafts = buildAgentSettlementDrafts({ agentBoard, walletConnectorRequests });

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(drafts, null, 2)}\n`);

console.log(outPath);
console.log(`status=${drafts.status}`);
console.log(`drafts=${drafts.summary.drafts}`);
console.log(`autonomousPayouts=${drafts.summary.autonomousPayouts}`);
