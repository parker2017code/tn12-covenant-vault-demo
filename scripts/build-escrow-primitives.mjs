import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildEscrowPrimitive } from "../src/escrowPrimitive.mjs";

const fixturePath = process.env.ESCROW_FIXTURE || "fixtures/EscrowPrimitives.json";
const outPath = process.env.OUT || "artifacts/escrow-primitives.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const registry = buildEscrowPrimitive(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`escrows=${registry.summary.total}`);
console.log(`needsAction=${registry.summary.needsAction}`);
