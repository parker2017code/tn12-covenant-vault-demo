import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildAgentCommitmentBoard } from "../src/agentCommitments.mjs";

const fixturePath = process.env.AGENT_COMMITMENTS_FIXTURE || "fixtures/AgentCommitments.json";
const outPath = process.env.OUT || "artifacts/agent-commitments.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const board = buildAgentCommitmentBoard(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(board, null, 2)}\n`);
console.log(outPath);
console.log(`tasks=${board.summary.tasks}`);
console.log(`acceptedPayloads=${board.summary.acceptedPayloads}`);
