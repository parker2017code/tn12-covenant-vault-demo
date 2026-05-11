import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const host = "127.0.0.1";
const server = createStaticServer(process.cwd());
await once(server.listen(0, host), "listening");
const { port } = server.address();
const url = `http://${host}:${port}/`;

try {
  const response = await fetch(url);
  assert.equal(response.ok, true, `Failed to load ${url}`);
  const html = await response.text();
  const proofFixture = JSON.parse(await readFile("fixtures/AcceptedProofTransactions.json", "utf8"));
  const checkpoint = JSON.parse(await readFile("artifacts/checkpointed-accepted-index.json", "utf8"));

  assert.equal(proofFixture.transactions.length, 9);
  assert.equal(checkpoint.summary.total, 44);
  assert.equal(checkpoint.summary.payloadEvents, 31);
  assert.match(html, /TN12 configured\. Proof transactions accepted\./);
  assert.match(html, /7 core \+ 2 auction \+ 7 role-separated \+ 44 indexed records/);
  assert.match(html, /<form id="assurance-form"/);
  assert.match(html, /id="proof-status"/);
  assert.match(html, /id="receipt-events"/);
  assert.match(html, /id="wallet-connector"/);
  assert.match(html, /id="defi-summary"/);
  assert.match(html, /id="defi-receipt-guard"/);
  assert.match(html, /id="next-ten-status"/);
  assert.match(html, /id="next-ten-tasks"/);

  console.log("UI smoke check passed.");
} finally {
  server.close();
  await once(server, "close").catch(() => {});
}

function createStaticServer(rootDir) {
  const root = resolve(rootDir);
  return createServer(async (request, response) => {
    try {
      const requestPath = normalize(decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname));
      const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const filePath = resolve(join(root, relativePath));
      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      const body = await readFile(filePath);
      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
