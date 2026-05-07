import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "@playwright/test";

const port = Number(process.env.UI_CHECK_PORT || 4186);
const host = "127.0.0.1";
const url = `http://${host}:${port}/`;
const chromiumPath = process.env.CHROMIUM_PATH || "/usr/bin/chromium";

const server = spawn("python3", ["-m", "http.server", String(port), "--bind", host], {
  stdio: ["ignore", "pipe", "pipe"]
});

const serverOutput = [];
server.stdout.on("data", (chunk) => serverOutput.push(String(chunk)));
server.stderr.on("data", (chunk) => serverOutput.push(String(chunk)));

try {
  await waitForServer(url);

  const browser = await chromium.launch({
    executablePath: chromiumPath,
    args: ["--no-sandbox"]
  });
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

  assert.equal(await page.locator("[data-proof-status].ok").count(), 4);
  await expectText(page, "body", "TN12 configured. Proof transactions accepted.");
  await expectText(page, "#assurance-issues", "Assurance shape is valid.");
  await expectText(page, "#indexer-summary", "Matched");
  await expectText(page, "#receipt-events", "No accepted payload receipts yet");
  await expectText(page, "#signal-artifact", "payload-size-ok");
  await expectText(page, "#payload-draft-status", "signed-not-broadcast");
  await expectText(page, "#payload-draft-status", "submit remains gated");

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  await browser.close();
  console.log("UI smoke check passed.");
} finally {
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
