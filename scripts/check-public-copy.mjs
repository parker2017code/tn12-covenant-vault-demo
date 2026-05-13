import fs from "node:fs";

const files = [
  "index.html",
  "results.html",
  "playground.html",
  "experiments.html",
  "lab.html",
  "src/ui/renderers/resultsExplorer.mjs",
  "src/ui/renderers/playgroundExplorer.mjs",
  "src/ui/renderers/selfServeLaneRunbook.mjs"
];

const forbidden = [
  /payload alone is not custody settlement/i,
  /pool-style reducers/i,
  /reducer turns/i,
  /receipts, reducers/i,
  /production custody are separate rails/i,
  /pool-style lab rails/i,
  /wallet-readable/i,
  /proof surface/i,
  /Live Play/i
];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(text)) {
      throw new Error(`${file} contains stale public copy: ${pattern}`);
    }
  }
}

console.log("Public copy checks passed.");
