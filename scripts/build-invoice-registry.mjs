import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildInvoiceRegistry } from "../src/invoiceReceipt.mjs";

const fixturePath = process.env.INVOICE_FIXTURE || "fixtures/InvoiceReceipts.json";
const outPath = process.env.OUT || "artifacts/invoice-registry.json";
const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
const registry = buildInvoiceRegistry(fixture);

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(outPath);
console.log(`invoices=${registry.summary.total}`);
console.log(`paid=${registry.summary.paid}`);
