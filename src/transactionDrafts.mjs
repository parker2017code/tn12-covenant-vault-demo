import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function buildTransactionDrafts(plan) {
  return plan.plans.map((item) => ({
    schema: "tn12-transaction-draft/v1",
    network: plan.network,
    status: "draft-not-serialized-not-signed-not-broadcast",
    id: item.id,
    lane: item.lane,
    purpose: item.purpose,
    contract: item.contract,
    entrypoint: item.entrypoint,
    source: {
      from: item.from,
      fundingOutpoint: plan.inputs.fundingOutpoint
    },
    destination: {
      to: item.to,
      expectedOutput: item.expectedOutput || null,
      expectedOutputs: item.expectedOutputs || null
    },
    amount: item.amount,
    requiredInputs: item.requiredInputs,
    timing: item.timing || null,
    caveats: item.caveats || [],
    nextProof: item.nextProof,
    notYetImplemented: [
      "SDK transaction object construction",
      "contract output serialization",
      "signature production",
      "broadcast",
      "explorer confirmation"
    ]
  }));
}

export async function writeTransactionDrafts(drafts, outDir = "artifacts/tx-drafts") {
  await mkdir(outDir, { recursive: true });
  const written = [];

  for (const draft of drafts) {
    const path = join(outDir, `${draft.id}.json`);
    await writeFile(path, `${JSON.stringify(draft, null, 2)}\n`);
    written.push(path);
  }

  return written;
}
