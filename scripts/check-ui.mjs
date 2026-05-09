import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { chromium } from "@playwright/test";

const port = Number(process.env.UI_CHECK_PORT || 4186);
const host = "127.0.0.1";
const url = `http://${host}:${port}/`;
const chromiumPath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";
let browser;

const server = spawn("python3", ["-m", "http.server", String(port), "--bind", host], {
  stdio: ["ignore", "pipe", "pipe"]
});

const serverOutput = [];
server.stdout.on("data", (chunk) => serverOutput.push(String(chunk)));
server.stderr.on("data", (chunk) => serverOutput.push(String(chunk)));

try {
  await waitForServer(url);

  const launchOptions = { args: ["--no-sandbox"] };
  if (existsSync(chromiumPath)) {
    launchOptions.executablePath = chromiumPath;
  }

  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("#assurance-form input[name='refundAddress']").fill("kaspatest:refund-smoke-check");
  await page.waitForSelector("#proof-status", { timeout: 15_000 });
  await page.waitForFunction(() => {
    const text = document.querySelector("#proof-status")?.textContent || "";
    return text.includes("All proof cards refreshed from TN12 API.");
  }, null, { timeout: 20_000 });

  assert.equal(await page.locator("[data-proof-status].ok").count(), 7);
  await expectText(page, "body", "TN12 configured. Proof transactions accepted.");
  await expectText(page, "#assurance-issues", "Assurance shape is valid.");
  await expectText(page, "#indexer-summary", "Matched");
  await expectText(page, "#invoice-summary", "Draft");
  await expectText(page, "#invoice-summary", "Review");
  await expectText(page, "#invoice-summary", "Refunded");
  await expectText(page, "#invoice-summary", "Errors");
  await expectText(page, "#invoice-list", "merchant-order-1337");
  await expectText(page, "#invoice-list", "accepted-receipt-indexed");
  await expectText(page, "#invoice-list", "merchant-refund-demo");
  await expectText(page, "#invoice-list", "refunded-receipt-indexed");
  await expectText(page, "#invoice-list", "merchant-error-demo");
  await expectText(page, "#invoice-list", "error-receipt-indexed");
  await expectText(page, "#invoice-draft", "signed-not-broadcast");
  await expectText(page, "#payload-readiness", "Payload submit readiness");
  await expectText(page, "#payload-readiness", "accepted-wrpc-payload-receipt-rest-blocked");
  await expectText(page, "#campaign-summary", "release-ready-from-accepted-pledges");
  await expectText(page, "#campaign-plans", "Release plan");
  await expectText(page, "#campaign-plans", "ready-to-draft-batch-release");
  await expectText(page, "#campaign-pledges", "pledge-docs-004");
  await expectText(page, "#campaign-pledges", "pledge-docs-005");
  await expectText(page, "#enforcement-summary", "Script");
  await expectText(page, "#enforcement-features", "Vault daily limit");
  await expectText(page, "#enforcement-features", "planner-indexer");
  await expectText(page, "#escrow-summary", "Escrows");
  await expectText(page, "#escrow-list", "Freelance wallet integration review");
  await expectText(page, "#escrow-list", "Review seller-release");
  await expectText(page, "#treasury-summary", "Payroll");
  await expectText(page, "#treasury-list", "Core team operating vault");
  await expectText(page, "#treasury-list", "Review delayed large withdrawal");
  await expectText(page, "#coordination-summary", "Intendos");
  await expectText(page, "#coordination-summary", "Routes");
  await expectText(page, "#coordination-packs", "pack-stag-docs-sprint");
  await expectText(page, "#coordination-packs", "satisfiable-transparent-pack");
  await expectText(page, "#coordination-packs", "transparent-settlement-brief-ready-not-production");
  await expectText(page, "#access-summary", "Redeemed");
  await expectText(page, "#access-list", "Kaspa dev workshop ticket");
  await expectText(page, "#access-list", "issuer-indexer");
  await expectText(page, "#mainnet-summary", "Mainnet paths");
  await expectText(page, "#mainnet-components", "Invoice / payload receipts");
  await expectText(page, "#mainnet-components", "tn12-toccata-only");
  await expectText(page, "#asset-summary", "Covenant");
  await expectText(page, "#asset-list", "Recoverable voucher");
  await expectText(page, "#asset-list", "future-covenant-native");
  await expectText(page, "#auction-summary", "Accepted");
  await expectText(page, "#auction-list", "Kaspa dev workshop sponsor pass");
  await expectText(page, "#auction-list", "do not claim atomic exchange");
  await expectText(page, "#defi-summary", "Missing rails");
  await expectText(page, "#defi-list", "Lending risk dashboard");
  await expectText(page, "#defi-list", "price oracle");
  await expectText(page, "#stable-summary", "Build now");
  await expectText(page, "#stable-list", "Issuer-backed redeemable unit");
  await expectText(page, "#stable-list", "native asset model");
  await expectText(page, "#stable-issuer-summary", "Outstanding");
  await expectText(page, "#stable-issuer-summary", "325.00");
  await expectText(page, "#stable-issuer-list", "signed-only");
  await expectText(page, "#agent-summary", "Accepted payloads");
  await expectText(page, "#agent-list", "Verify invoice payload receipt vertical slice");
  await expectText(page, "#agent-list", "do not release or refund automatically");
  await expectText(page, "#build-status-summary", "Bases");
  await expectText(page, "#build-status-lanes", "Auction / Intent Prototype");
  await expectText(page, "#build-status-lanes", "Payload Receipt / Invoice App");
  await expectText(page, "#build-status-lanes", "ZK / Anchor Readiness");
  await expectText(page, "#project-plan-summary", "Done");
  await expectText(page, "#project-plan-next", "wallet-connector-submit");
  await expectText(page, "#project-plan-vision", "wallet-reviewed Kaspa app console");
  await expectText(page, "#submit-summary", "Drafts");
  await expectText(page, "#submit-drafts", "Payload receipt self-send");
  await expectText(page, "#submit-drafts", "KASPA_WRPC_URL");
  await expectText(page, "#submit-drafts", "Escrow funding");
  await expectText(page, "#submit-drafts", "Escrow release");
  await expectText(page, "#submit-drafts", "Accepted seller-release proof");
  await expectText(page, "#submit-drafts", "Escrow DAA refund");
  await expectText(page, "#submit-drafts", "Escrow cancel");
  await expectText(page, "#submit-drafts", "computeBudget 30");
  await expectText(page, "#submit-drafts", "local TN12 kaspa-wasm 1.1.1-toc.1 SDK");
  await expectText(page, "#submit-drafts", "--submit");
  await expectText(page, "#research-summary", "Candidates");
  await expectText(page, "#research-candidates", "Uniswap-style AMM");
  await expectText(page, "#research-candidates", "Wallet API send route");
  await expectText(page, "#receipt-events", "order-receipt / paid");
  await expectText(page, "#receipt-events", "merchant-order-1337");
  await expectText(page, "#receipt-events", "order-receipt / refunded");
  await expectText(page, "#receipt-events", "merchant-refund-demo");
  await expectText(page, "#receipt-events", "order-receipt / error");
  await expectText(page, "#receipt-events", "merchant-error-demo");
  await expectText(page, "#signal-artifact", "payload-size-ok");
  await expectText(page, "#payload-draft-status", "signed-not-broadcast");
  await expectText(page, "#payload-draft-status", "accepted through TN12 JSON wRPC");
  await expectText(page, "#wallet-connector", "wallet-submit-package-ready");
  await expectText(page, "#wallet-connector", "wallet-submit-ledger-ready");
  await expectText(page, "#wallet-connector", "wallet-standard-request-candidates-ready");
  await expectText(page, "#wallet-connector", "wallet-standard-signer-validation-ready");
  await expectText(page, "#wallet-connector", "pending wallet-submit candidates");
  await expectText(page, "#master-roadmap", "Payload Receipt / Invoice App");
  await expectText(page, "#master-roadmap", "AI-Agent Commitment Board");
  await expectText(page, "#attestation-summary", "Verified");
  await expectText(page, "#attestation-summary", "Signatures");
  await expectText(page, "#attestation-summary", "Influence");
  await expectText(page, "#attestation-sources", "pool-operator-gamma");
  await expectText(page, "#attestation-signals", "Simulated prediction market input only.");
  await expectText(page, "#attestation-signals", "Signature verified; influence ready.");
  await expectText(page, "#prediction-summary", "Reviews");
  await expectText(page, "#prediction-markets", "Network stress watch");
  await expectText(page, "#prediction-markets", "Accepted event 9f976656...9c0daca7.");
  await expectText(page, "#prediction-markets", "threshold-blocked");
  await expectText(page, "#prediction-suggestions", "Watch only");
  await expectText(page, "#prediction-suggestions", "Accepted review 1d5a3c24...078c6f3d.");

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  console.log("UI smoke check passed.");
} finally {
  await browser?.close().catch(() => {});
  server.kill("SIGTERM");
  await once(server, "exit").catch(() => {});
}

async function waitForServer(targetUrl) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10_000) {
    if (server.exitCode !== null) {
      throw new Error(`Static server exited early: ${serverOutput.join("")}`);
    }
    try {
      const response = await fetch(targetUrl);
      if (response.ok) return;
    } catch {
      // Keep polling until the Python server is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Static server did not respond at ${targetUrl}`);
}

async function expectText(page, selector, expected) {
  const text = await page.locator(selector).textContent({ timeout: 10_000 });
  assert.match(text || "", new RegExp(escapeRegExp(expected)));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
