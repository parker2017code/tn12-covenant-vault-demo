import assert from "node:assert/strict";
import { once } from "node:events";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";
import { chromium } from "@playwright/test";

const host = "127.0.0.1";
const server = createStaticServer(process.cwd());
await once(server.listen(0, host), "listening");
const { port } = server.address();
const url = `http://${host}:${port}/`;

try {
  const response = await fetch(url);
  assert.equal(response.ok, true, `Failed to load ${url}`);
  const html = await response.text();
  const resultsResponse = await fetch(`${url}results.html`);
  assert.equal(resultsResponse.ok, true, "Failed to load results.html");
  const resultsHtml = await resultsResponse.text();
  const playgroundResponse = await fetch(`${url}playground.html`);
  assert.equal(playgroundResponse.ok, true, "Failed to load playground.html");
  const playgroundHtml = await playgroundResponse.text();
  const proofFixture = JSON.parse(await readFile("fixtures/AcceptedProofTransactions.json", "utf8"));
  const checkpoint = JSON.parse(await readFile("artifacts/checkpointed-accepted-index.json", "utf8"));

  assert.equal(proofFixture.transactions.length, 9);
  assert.equal(checkpoint.summary.total, 53);
  assert.equal(checkpoint.summary.payloadEvents, 40);
  assert.match(html, /TN12 configured\. Proof transactions accepted\./);
  assert.match(html, /7 core \+ 2 auction \+ 7 role-separated \+ 53 indexed records/);
  assert.match(html, /Accepted payload events[\s\S]*<strong>40<\/strong>/);
  assert.match(html, /npm run operator:refresh/);
  assert.match(html, /id="reviewer-path"/);
  assert.match(html, /docs\/AUDIT_MAP\.md/);
  assert.doesNotMatch(html, /href="#prediction-hedge"/);
  assert.match(html, /href="lab\.html"/);
  const appJs = await readFile("app.js", "utf8");
  const pageControllers = await readFile("src/ui/pageControllers.mjs", "utf8");
  assert.match(appJs, /runProofPageController/);
  assert.match(appJs, /runLabPageController/);
  assert.match(pageControllers, /detectPageController/);
  assert.doesNotMatch(html, /<form id="assurance-form"/);
  assert.match(html, /id="proof-status"/);
  assert.match(html, /id="receipt-events"/);
  assert.match(html, /id="wallet-connector"/);
  assert.match(html, /External wallets should be able to play/);
  assert.match(html, /id="defi-receipt-guard"/);
  assert.match(html, /id="defi-simulation-summary"/);
  assert.match(html, /id="defi-simulation-list"/);
  assert.match(html, /href="results\.html"/);
  assert.match(resultsHtml, /id="results-summary"/);
  assert.match(resultsHtml, /id="knowledge-levels"/);
  assert.match(resultsHtml, /id="results-rails"/);
  assert.match(resultsHtml, /id="standards-adapters"/);
  assert.match(resultsHtml, /id="source-map"/);
  assert.match(resultsHtml, /External links are design references/);
  assert.match(resultsHtml, /What should be clickable/);
  assert.match(resultsHtml, /Accepted TN12 activity/);
  assert.match(resultsHtml, /Live playground/);
  assert.doesNotMatch(resultsHtml, /X post|x-post-draft|Draft post/);
  assert.doesNotMatch(resultsHtml, /Future implementation target/);
  assert.match(resultsHtml, /src="public-explorer\.js"/);
  assert.doesNotMatch(resultsHtml, /src="app\.js"/);
  assert.match(resultsHtml, /href="playground\.html"/);
  assert.match(playgroundHtml, /TN12 playground/);
  assert.match(playgroundHtml, /src="public-explorer\.js"/);
  assert.doesNotMatch(playgroundHtml, /src="app\.js"/);
  assert.match(playgroundHtml, /id="playground-activity-strip"/);
  assert.match(playgroundHtml, /id="playground-summary"/);
  assert.match(playgroundHtml, /id="playground-roles"/);
  assert.match(playgroundHtml, /id="playground-actions"/);
  assert.match(playgroundHtml, /id="playground-replay-summary"/);
  assert.match(playgroundHtml, /id="playground-session-balances"/);
  assert.match(playgroundHtml, /id="playground-balances"/);
  assert.match(playgroundHtml, /id="playground-blocked"/);
  assert.match(playgroundHtml, /4 accepted txs/);
  assert.match(playgroundHtml, /id="playground-levels"/);
  assert.match(playgroundHtml, /id="playground-tx-map"/);
  assert.match(playgroundHtml, /Fast testnet money/);
  assert.doesNotMatch(html + resultsHtml + playgroundHtml, /tn12\.kaspa\.stream\/txs\//);
  assert.match(html + resultsHtml + playgroundHtml, /tn12\.kaspa\.stream\/transactions\//);
  assert.doesNotMatch(playgroundHtml, /What the playground will run/);
  assert.match(await readFile("lab.html", "utf8"), /class="lab-page"/);
  assert.match(await readFile("lab.html", "utf8"), /id="product-map"/);
  assert.match(await readFile("lab.html", "utf8"), /id="runbook"/);

  await checkRenderedPages(url);

  console.log("UI smoke check passed.");
} finally {
  server.close();
  await once(server, "close").catch(() => {});
}

async function checkRenderedPages(url) {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const path of ["index.html", "lab.html", "results.html", "playground.html"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type())) errors.push(message.text());
      });
      const response = await page.goto(`${url}${path}`, { waitUntil: "networkidle" });
      assert.equal(response?.ok(), true, `${path} did not return 200`);
      assert.deepEqual(errors, [], `${path} had browser errors: ${errors.join("; ")}`);
      const emptyLiveRegions = await page.locator("[aria-live]").evaluateAll((nodes) => nodes
        .filter((node) => !node.textContent.trim() && node.children.length === 0)
        .map((node) => node.id || node.className || node.tagName));
      assert.deepEqual(emptyLiveRegions, [], `${path} has empty live regions`);
      await assertLocalLinks(page, path);
      await page.close();
    }

    const page = await browser.newPage();
    await page.goto(`${url}playground.html`, { waitUntil: "networkidle" });
    await page.waitForSelector("#playground-session article", { timeout: 5000 });
    const playgroundText = await page.locator("body").innerText();
    assert.match(playgroundText, /4 TKAS second deposit/);
    assert.match(playgroundText, /User B -> Pool/);
    assert.match(playgroundText, /3bfca807/);
    assert.match(playgroundText, /30 TKAS/);
    assert.match(playgroundText, /User A/);
    assert.match(playgroundText, /7 TKAS/);
    assert.match(playgroundText, /4 accepted txs/);
    assert.match(playgroundText, /Open lab tools/);
    assert.equal(await page.locator('a[href*="tn12.kaspa.stream/txs/"]').count(), 0);
    assert.equal(await page.locator('#playground-activity-strip a[href*="tn12.kaspa.stream/transactions/"]').count(), 4);
    assert.equal(await page.locator('#playground-tx-map article').count(), 5);
    assert.ok(await page.locator('#playground-roles [data-copy^="kaspatest:"]').count() >= 6);
    assert.ok(await page.locator('#playground-balances details.full-ledger').count() >= 1);

    await page.goto(`${url}results.html`, { waitUntil: "networkidle" });
    await page.waitForSelector("#standards-adapters article", { timeout: 5000 });
    const resultsText = await page.locator("body").innerText();
    assert.match(resultsText, /x402-style HTTP payment adapter/);
    assert.match(resultsText, /Accepted transfers/i);
    assert.match(resultsText, /25/);
    assert.match(resultsText, /external reference/);
    assert.match(resultsText, /repo source/);
    assert.doesNotMatch(resultsText, /Draft post|X post/);
    assert.equal(await page.locator('a[href*="tn12.kaspa.stream/txs/"]').count(), 0);
    assert.ok(await page.locator('#results-feed a[href*="tn12.kaspa.stream/transactions/"]').count() >= 6);
    await page.goto(`${url}lab.html`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("#product-map .product-grid a").count(), 12);
    const productMapText = await page.locator("#product-map").innerText();
    assert.match(productMapText, /What people can try/);
    assert.match(productMapText, /External wallet handoff/);
    assert.match(productMapText, /Get and verify tKAS/);
    const runbookText = await page.locator("#runbook").innerText();
    assert.match(runbookText, /If you are determined/);
    assert.match(runbookText, /Not finished: AMM custody/);
    assert.match(runbookText, /Replay before believing it/);
    assert.ok(await page.locator("details.lab-drawer").count() >= 20);
    assert.equal(await page.locator("details.lab-drawer[open]").count(), 0);
    const firstPanelId = await page.locator("main > section.panel, main > details.lab-drawer").first().evaluate((node) => node.id || node.querySelector("section")?.id || "");
    assert.equal(firstPanelId, "product-map");
    await page.goto(`${url}lab.html#submit`, { waitUntil: "networkidle" });
    await page.waitForSelector(".wallet-play-card", { timeout: 5000 });
    const submitText = await page.locator("#submit").innerText();
    assert.match(submitText, /Use your own TN12 wallet without sharing keys/);
    assert.ok(await page.locator('.wallet-play-card a[href="artifacts/wallet-standard-requests.json"]').count() === 1);
    await page.close();
  } finally {
    await browser.close();
  }
}

async function assertLocalLinks(page, path) {
  const linksToCheck = await page.locator("a[href]").evaluateAll((links) => {
    const pageNames = new Set(["index.html", "lab.html", "results.html", "playground.html"]);
    return links.flatMap((link) => {
      const href = link.getAttribute("href") || "";
      if (/^(https?:|mailto:)/.test(href)) return [];
      const url = new URL(href, window.location.href);
      const targetPath = url.pathname.split("/").pop() || "index.html";
      if (targetPath === window.location.pathname.split("/").pop() && url.hash) {
        const id = decodeURIComponent(url.hash.slice(1));
        if (!document.getElementById(id)) return [`Missing local anchor ${href}`];
      }
      if (pageNames.has(targetPath)) return [];
      return [url.pathname.replace(/^\/+/, "")];
    });
  });

  const problems = [];
  for (const file of linksToCheck) {
    try {
      await access(file);
    } catch {
      problems.push(`Missing local target ${file}`);
    }
  }
  assert.deepEqual(problems, [], `${path} has broken local links`);
}

function createStaticServer(rootDir) {
  const root = resolve(rootDir);
  return createServer(async (request, response) => {
    try {
      const requestPath = normalize(decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname));
      const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const filePath = resolve(join(root, relativePath));
      const rootRelativePath = relative(root, filePath);
      if (rootRelativePath.startsWith("..") || resolve(rootRelativePath) === rootRelativePath) {
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
