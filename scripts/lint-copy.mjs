import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checkedExtensions = new Set([
  ".md",
  ".mdx",
  ".html",
  ".htm",
  ".tsx",
  ".jsx",
  ".ts",
  ".js",
  ".astro",
  ".vue",
  ".svelte",
  ".txt",
  ".yml",
  ".yaml",
  ".json",
]);

const skipDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
  "coverage",
  "artifacts",
  "fixtures",
  "generated",
  "vendor",
  "private-review",
]);

const skipFiles = new Set([
  "AGENTS.md",
  "scripts/lint-copy.mjs",
  "package-lock.json",
]);

const rules = [
  {
    name: "not-reframe-but",
    pattern: /\bnot\s+(?:just|only|merely|simply)?\s*[^.!?\n]{1,120}\s+but\s+(?:also\s+)?[^.!?\n]{1,120}/gi,
  },
  {
    name: "more-than-reframe",
    pattern: /\bmore\s+than\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "merely-reframe",
    pattern: /\b(?:is|are|was|were|isn't|aren't|wasn't|weren't)\s+(?:merely|simply|just)\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "beyond-reframe",
    pattern: /\b(?:goes?|extends?|moves?)\s+beyond\s+[^.!?\n]{1,120}/gi,
  },
  {
    name: "rather-than-reframe",
    pattern: /\brather\s+than\s+[^.!?\n]{1,120}/gi,
  },
];

const failures = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) walk(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    if (skipFiles.has(relativePath)) continue;
    if (!checkedExtensions.has(path.extname(entry.name))) continue;

    checkFile(fullPath, relativePath);
  }
}

function checkFile(fullPath, relativePath) {
  const text = fs.readFileSync(fullPath, "utf8");
  const lines = text.split(/\r?\n/);

  for (const rule of rules) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);

      if (match) {
        failures.push({
          file: relativePath,
          line: i + 1,
          rule: rule.name,
          text: line.trim(),
        });
      }
    }
  }
}

walk(root);

if (failures.length > 0) {
  console.error("\nCopy lint failed. Rewrite these LLM-cadence patterns:\n");

  for (const failure of failures) {
    console.error(`${failure.file}:${failure.line} [${failure.rule}] ${failure.text}`);
  }

  console.error("\nRewrite as direct positive claims. Avoid rhetorical contrast framing.\n");
  process.exit(1);
}

console.log("Copy lint passed.");
