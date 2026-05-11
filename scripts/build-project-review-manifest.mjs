import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { buildProjectReviewManifest } from "../src/projectReviewManifest.mjs";

const outPath = process.env.OUT || "artifacts/project-review-manifest.json";

const manifest = buildProjectReviewManifest({
  packageJson: await readJson("package.json"),
  docs: await readDocs([
    "README.md",
    "MAINNET_READINESS.md",
    "TN12_HANDOFF.md",
    "docs/PROGRESS.md",
    "docs/NEXT_STEPS.md",
    "docs/AUDIT_MAP.md",
    "docs/SCRIPT_INDEX.md",
    "docs/TN12_TEST_MATRIX.md"
  ]),
  artifacts: await readArtifacts([
    "artifacts/proven-status.json",
    "artifacts/operator-receipt-pack.json",
    "artifacts/mainnet-readiness.json",
    "artifacts/defi-artifact-manifest.json",
    "artifacts/durable-replay-promotion-guard.json",
    "artifacts/wallet-submit-result-validation.json",
    "artifacts/checkpointed-accepted-index.json",
    "artifacts/proof-evidence.json",
    "artifacts/role-separated-proof-evidence.json"
  ])
});

await mkdir("artifacts", { recursive: true });
await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outPath);
console.log(`status=${manifest.status}`);
console.log(`problems=${manifest.summary.problems}`);

async function readDocs(paths) {
  const entries = await Promise.all(paths.map(async (path) => {
    try {
      const info = await stat(path);
      return [path, { present: info.isFile(), bytes: info.size }];
    } catch {
      return [path, { present: false, bytes: 0 }];
    }
  }));
  return Object.fromEntries(entries);
}

async function readArtifacts(paths) {
  const entries = await Promise.all(paths.map(async (path) => {
    try {
      const artifact = await readJson(path);
      return [path, { present: true, schema: artifact.schema, status: artifact.status, summary: artifact.summary }];
    } catch {
      return [path, { present: false, schema: "", status: "" }];
    }
  }));
  return Object.fromEntries(entries);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
