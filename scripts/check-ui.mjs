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
  for (const asset of [
    "favicon.svg",
    "favicon.png",
    "favicon.ico",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "site.webmanifest",
    "og-tn12-proof-lab.png",
  ]) {
    const assetResponse = await fetch(`${url}${asset}`);
    assert.equal(assetResponse.ok, true, `Failed to load ${asset}`);
  }
  for (const publicPageHtml of [html, resultsHtml, playgroundHtml, await readFile("lab.html", "utf8")]) {
    assert.match(publicPageHtml, /class="brand-home" href="index\.html"/);
    assert.match(publicPageHtml, /rel="apple-touch-icon" href="apple-touch-icon\.png"/);
    assert.match(publicPageHtml, /rel="manifest" href="site\.webmanifest"/);
    assert.match(publicPageHtml, /property="og:image" content="og-tn12-proof-lab\.png"/);
    assert.match(publicPageHtml, /name="twitter:image" content="og-tn12-proof-lab\.png"/);
  }
  const proofFixture = JSON.parse(await readFile("fixtures/AcceptedProofTransactions.json", "utf8"));
  const checkpoint = JSON.parse(await readFile("artifacts/checkpointed-accepted-index.json", "utf8"));
  const selfServeRunbook = JSON.parse(await readFile("artifacts/self-serve-lane-runbook.json", "utf8"));

  assert.equal(proofFixture.transactions.length, 9);
  assert.equal(checkpoint.summary.total, 53);
  assert.equal(checkpoint.summary.payloadEvents, 40);
  assert.equal(selfServeRunbook.summary.lanes, 12);
  assert.equal(selfServeRunbook.summary.basedAppPrototypes, 4);
  assert.match(html, /TN12 configured\. Proof transactions accepted\./);
  assert.match(html, /Money moved\. Proofs accepted\. State replayed\./);
  assert.match(html, /Accepted payload events[\s\S]*<strong>40<\/strong>/);
  assert.match(html, /Multi-wallet TN12 evidence is live\./);
  assert.match(html, /42e14cf1\.\.\.bad8a5b5/);
  assert.match(html, /reviewer-settlement-flow\.json/);
  assert.match(html, /Done, WIP, future\./);
  assert.match(html, /npm run proof:records/);
  assert.doesNotMatch(html, /id="check-path"/);
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
  assert.doesNotMatch(html, /id="receipt-events"/);
  assert.doesNotMatch(html, /id="wallet-connector"/);
  assert.doesNotMatch(html, /The user-wallet path is:/);
  assert.doesNotMatch(html, /id="defi-receipt-guard"/);
  assert.doesNotMatch(html, /id="defi-simulation-summary"/);
  assert.doesNotMatch(html, /id="defi-simulation-list"/);
  assert.match(html, /href="results\.html"/);
  assert.match(resultsHtml, /id="results-summary"/);
  assert.match(resultsHtml, /id="knowledge-levels"/);
  assert.match(resultsHtml, /id="results-rails"/);
  assert.match(resultsHtml, /id="standards-adapters"/);
  assert.match(resultsHtml, /Future adapters can plug into receipts/);
  assert.match(resultsHtml, /Show adapter ideas/);
  assert.match(resultsHtml, /docs\/PRODUCT_EXECUTION_PLAN\.md/);
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
  assert.match(playgroundHtml, /id="playground-quickstart"/);
  assert.match(playgroundHtml, /id="defi-flow-map"/);
  assert.match(playgroundHtml, /id="playground-wallet-flow"/);
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
  assert.match(await readFile("lab.html", "utf8"), /id="lane-runbook"/);
  assert.match(await readFile("lab.html", "utf8"), /docs\/PRODUCT_EXECUTION_PLAN\.md/);

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
      for (const viewport of [
        { name: "desktop", width: 1280, height: 900 },
        { name: "mobile", width: 390, height: 844 },
      ]) {
        const page = await browser.newPage({ viewport });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (["error", "warning"].includes(message.type())) errors.push(message.text());
        });
        const response = await page.goto(`${url}${path}`, { waitUntil: "domcontentloaded" });
        assert.equal(response?.ok(), true, `${path} did not return 200`);
        assert.deepEqual(errors, [], `${path} had browser errors: ${errors.join("; ")}`);
        await waitForDynamicContent(page, path);
        if (path === "index.html") await assertProofHomeDensity(page, viewport.name);
        await assertNoViewportOverflow(page, `${path} ${viewport.name}`);
        if (viewport.name === "mobile") await assertMobileControls(page, path);
        assert.equal(await page.locator('.brand-home[href="index.html"]').count(), 1, `${path} needs one header home link`);
        assert.equal(await page.locator(".brand-home").evaluate((node) => getComputedStyle(node).cursor), "pointer", `${path} header home link must look clickable`);
        const emptyLiveRegions = await page.locator("[aria-live]").evaluateAll((nodes) => nodes
          .filter((node) => !node.textContent.trim() && node.children.length === 0)
          .map((node) => node.id || node.className || node.tagName));
        assert.deepEqual(emptyLiveRegions, [], `${path} has empty live regions`);
        await assertLocalLinks(page, path);
        await page.close();
      }
    }

    const page = await browser.newPage();
    await page.goto(`${url}index.html`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#multi-wallet .evidence-strip a").count(), 4);
    const proofHomeText = await page.locator("body").innerText();
    assert.match(proofHomeText, /Reviewer settlement command package/);
    assert.doesNotMatch(proofHomeText, /One repeatable settlement flow a reviewer can run/);

    await page.goto(`${url}playground.html`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#playground-session article", { timeout: 5000 });
    const playgroundText = await page.locator("body").innerText();
    assert.match(playgroundText, /4 TKAS second deposit/);
    assert.match(playgroundText, /User B -> Pool/);
    assert.match(playgroundText, /3bfca807/);
    assert.match(playgroundText, /4 accepted txs/);
    assert.match(playgroundText, /DeFi multi-wallet flow/);
    assert.match(playgroundText, /custody promotions/i);
    assert.match(playgroundText, /Open lab tools/);
    assert.match(playgroundText, /Use your own wallet/);
    assert.doesNotMatch(playgroundText, /Bring your own external wallet/);
    assert.doesNotMatch(playgroundText, /TN12_ACCEPTED_TARGET|LOCAL_KEY_CUSTODY_TEST|INDEXER_DERIVED|REJECTED_BY_REDUCER/);
    assert.match(playgroundText, /Sign outside the repo/);
    assert.match(playgroundText, /Build a based-app lane/);
    assert.equal(await page.locator("details.section-drawer").count(), 2);
    assert.equal(await page.locator("details.section-drawer[open]").count(), 0);
    await page.locator("details.section-drawer").nth(1).evaluate((node) => {
      node.open = true;
    });
    const replayText = await page.locator("#replay").innerText();
    assert.match(replayText, /30 TKAS/);
    assert.match(replayText, /User A/i);
    assert.match(replayText, /7 TKAS/);
    assert.equal(await page.locator('a[href*="tn12.kaspa.stream/txs/"]').count(), 0);
    assert.equal(await page.locator("#playground-quickstart a").count(), 4);
    assert.ok(await page.locator('#playground-quickstart a[href="#activity"]').count() === 1);
    assert.ok(await page.locator('#playground-quickstart a[href="lab.html#product-map"]').count() === 1);
    assert.ok(await page.locator('a[href="docs/CLI_FROM_ZERO.md"]').count() >= 1);
    assert.ok(await page.locator('#wallet a[href="lab.html#submit"]').count() === 1);
    assert.equal(await page.locator('#playground-activity-strip a[href*="tn12.kaspa.stream/transactions/"]').count(), 4);
    assert.equal(await page.locator('#playground-tx-map article').count(), 5);
    assert.equal(await page.locator('#defi-flow-map article').count(), 6);
    assert.ok(await page.locator('#defi-flow-map a[href*="tn12.kaspa.stream/transactions/42e14cf17dba547e228729e048d2efc9ed70505b874a7ae9e32dafcdbad8a5b5"]').count() === 1);
    assert.ok(await page.locator('#playground-roles [data-copy^="kaspatest:"]').count() >= 6);
    assert.ok(await page.locator('#playground-balances details.full-ledger').count() >= 1);

    await page.goto(`${url}results.html`, { waitUntil: "domcontentloaded" });
    await page.locator("#standards details.evidence-drawer").evaluate((node) => {
      node.open = true;
    });
    await page.waitForSelector("#standards-adapters article", { state: "attached", timeout: 5000 });
    const resultsText = await page.locator("body").innerText();
    assert.match(resultsText, /x402-style HTTP payment adapter/);
    assert.match(resultsText, /future adapter/i);
    assert.match(resultsText, /Accepted transfers/i);
    assert.match(resultsText, /40/);
    assert.doesNotMatch(resultsText, /TN12_ACCEPTED|LOCAL_KEY_CUSTODY_TEST|INDEXER_DERIVED|MAINNET_BLOCKED|PLANNER_ONLY/);
    assert.doesNotMatch(resultsText, /External signer|autonomous pool custody|production custody readiness/i);
    assert.doesNotMatch(resultsText, /Draft post|X post/);
    assert.equal(await page.locator('a[href*="tn12.kaspa.stream/txs/"]').count(), 0);
    assert.ok(await page.locator('#results-feed a[href*="tn12.kaspa.stream/transactions/"]').count() >= 6);
    const claimLinkAffordances = await page.locator(".claim-grid a").evaluateAll((links) => links.map((link) => ({
      text: link.textContent,
      after: window.getComputedStyle(link, "::after").content,
      cursor: window.getComputedStyle(link).cursor,
      href: link.getAttribute("href")
    })));
    assert.ok(claimLinkAffordances.length >= 3, "results claim links should stay real links");
    assert.deepEqual(claimLinkAffordances.filter((item) => !item.href), [], "claim-grid links need href targets");
    assert.deepEqual(claimLinkAffordances.filter((item) => !/Open/.test(item.after)), [], "claim-grid links need visible Open affordance");
    await page.goto(`${url}lab.html`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#product-map .product-group").count(), 3);
    assert.equal(await page.locator("#product-map .product-group a").count(), 10);
    const productMapText = await page.locator("#product-map").innerText();
    assert.match(productMapText, /Pick one lane/);
    assert.match(productMapText, /Proof products/i);
    assert.match(productMapText, /Product ideas/i);
    assert.match(productMapText, /Mainnet blockers/i);
    assert.match(productMapText, /Accepted proof txids/);
    assert.match(productMapText, /Wallet handoff/);
    assert.match(productMapText, /Settlement and app lanes/);
    const runbookText = await page.locator("#runbook").innerText();
    assert.match(runbookText, /Run it yourself/);
    assert.match(runbookText, /Replay before believing it/);
    assert.doesNotMatch(runbookText, /Transparent Stag\/Intendo\/Pack/);
    await page.locator("#lane-runbook").evaluate((node) => {
      node.open = true;
    });
    await page.waitForSelector("#self-serve-lanes article", { state: "attached", timeout: 5000 });
    assert.equal(await page.locator("#self-serve-lanes article").count(), 12);
    const laneRunbookText = await page.locator("#lane-runbook").evaluate((node) => node.textContent || "");
    assert.match(laneRunbookText, /DeFi lab/);
    assert.match(laneRunbookText, /Coordination \/ Stag/);
    assert.match(laneRunbookText, /based app prototype/i);
    assert.match(laneRunbookText, /Use your own wallet/);
    assert.match(laneRunbookText, /AMM custody/);
    assert.match(laneRunbookText, /npm run defi:refresh/);
    const passiveClaimCards = await page.locator(".claim-grid article").evaluateAll((cards) => cards.map((card) => ({
      cursor: window.getComputedStyle(card).cursor,
      after: window.getComputedStyle(card, "::after").content
    })));
    assert.deepEqual(passiveClaimCards.filter((item) => item.cursor === "pointer"), [], "passive claim cards must not look clickable");
    assert.deepEqual(passiveClaimCards.filter((item) => /Open/.test(item.after)), [], "passive claim cards must not show Open affordance");
    assert.equal(await page.locator("details.lab-drawer").count(), 7);
    assert.equal(await page.locator("details.lab-drawer[open]").count(), 0);
    const firstPanelId = await page.locator("main > section.panel, main > details.lab-drawer").first().evaluate((node) => node.id || node.querySelector("section")?.id || "");
    assert.equal(firstPanelId, "product-map");
    await page.goto(`${url}lab.html#scheduler-workbench`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#scheduler-workbench").evaluate((node) => node.closest("details.lab-drawer")?.open), true);
    await page.waitForSelector("#scheduler-workbench-jobs article", { timeout: 5000 });
    const schedulerText = await page.locator("#scheduler-workbench").innerText();
    assert.match(schedulerText, /Small version first/);
    assert.match(schedulerText, /Replay the accepted scheduler trigger/);
    assert.match(schedulerText, /Accepted trigger/);
    assert.match(schedulerText, /Transparent coordination pack/);
    assert.match(schedulerText, /Protocol scheduler/i);
    assert.match(schedulerText, /Separate research work/i);
    assert.equal(await page.locator("#scheduler-workbench-jobs article").count(), 7);
    await page.goto(`${url}lab.html#coordination`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".coordination-run-card", { timeout: 5000 });
    await page.waitForSelector("#coordination-dossier article", { state: "attached", timeout: 5000 });
    const coordinationText = await page.locator("#coordination").innerText();
    assert.match(coordinationText, /Run a conditional commitment pack/);
    assert.match(coordinationText, /Backers commit only if enough compatible backers also commit/);
    assert.match(coordinationText, /3 commitments qualify/);
    assert.match(coordinationText, /Reviewer dossier/);
    assert.match(coordinationText, /100 TKAS/);
    assert.match(coordinationText, /4d84472e/);
    assert.match(coordinationText, /threshold not met/i);
    assert.match(coordinationText, /refund-or-keep-accumulating/);
    await page.goto(`${url}lab.html#submit`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".wallet-play-card", { timeout: 5000 });
    const submitText = await page.locator("#submit").innerText();
    assert.match(submitText, /Use your own TN12 wallet without sharing keys/);
    assert.ok(await page.locator('.wallet-play-card a[href="artifacts/wallet-standard-requests.json"]').count() === 1);
    await page.close();
  } finally {
    await browser.close();
  }
}

async function assertProofHomeDensity(page, viewportName) {
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector(".proof-hero");
    const proofs = document.querySelector("#proofs");
    return {
      heroHeight: Math.round(hero?.getBoundingClientRect().height || 0),
      proofsTop: Math.round(proofs?.getBoundingClientRect().top || 0),
    };
  });
  const maxHeroHeight = viewportName === "mobile" ? 620 : 340;
  const maxProofsTop = viewportName === "mobile" ? 850 : 520;
  assert.ok(metrics.heroHeight > 0 && metrics.heroHeight <= maxHeroHeight, `proof home ${viewportName} hero too tall: ${metrics.heroHeight}px`);
  assert.ok(metrics.proofsTop > 0 && metrics.proofsTop <= maxProofsTop, `proof home ${viewportName} proof table too low: ${metrics.proofsTop}px`);
}

async function waitForDynamicContent(page, path) {
  const selectors = {
    "index.html": ["#proof-list tr[data-proof-row], #proof-list article", "#reviewer article"],
    "lab.html": ["#product-map .product-group", "#invoice-summary article", "#submit-summary article"],
    "results.html": ["#results-summary article", "#results-feed article"],
    "playground.html": ["#playground-quickstart a", "#playground-session article"],
  }[path] || [];

  for (const selector of selectors) {
    await page.waitForFunction((targetSelector) => document.querySelectorAll(targetSelector).length > 0, selector, { timeout: 7000 });
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

async function assertNoViewportOverflow(page, label) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const problems = [];
    const allowance = 2;
    if (doc.scrollWidth > window.innerWidth + allowance) {
      problems.push(`document ${doc.scrollWidth}px > viewport ${window.innerWidth}px`);
    }

    for (const element of document.querySelectorAll("body *")) {
      if (element.closest(".skip-link")) continue;
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.left < -allowance || rect.right > window.innerWidth + allowance) {
        const name = [
          element.tagName.toLowerCase(),
          element.id ? `#${element.id}` : "",
          typeof element.className === "string" && element.className ? `.${element.className.trim().split(/\s+/).join(".")}` : "",
        ].join("");
        problems.push(`${name || element.tagName} [${Math.round(rect.left)}, ${Math.round(rect.right)}]`);
      }
    }
    return problems.slice(0, 12);
  });

  assert.deepEqual(result, [], `${label} has horizontal overflow: ${result.join("; ")}`);
}

async function assertMobileControls(page, path) {
  const problems = await page.evaluate(() => {
    const selectors = [".theme-toggle", ".nav-menu-button", ".nav-cta", ".nav a", ".button", "summary", "button"];
    return selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)).flatMap((element) => {
      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return [];
      const rect = element.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return [];
      if (rect.right > window.innerWidth + 2 || rect.left < -2) {
        return [`${selector} outside viewport`];
      }
      return [];
    }));
  });

  assert.deepEqual(problems, [], `${path} has mobile controls outside viewport`);
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
