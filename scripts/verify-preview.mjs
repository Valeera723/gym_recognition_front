import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const previewUrl = "http://127.0.0.1:4173/preview.html";
const playwrightModule = process.env.PLAYWRIGHT_MODULE_URL ?? "playwright";

const server = spawn(process.execPath, ["scripts/static-preview-server.mjs"], {
  cwd: root,
  stdio: "pipe",
});

try {
  await waitFor(previewUrl);
  const { chromium } = await import(playwrightModule);
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_BROWSER_PATH) {
    launchOptions.executablePath = process.env.PLAYWRIGHT_BROWSER_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(previewUrl, { waitUntil: "networkidle" });

  const result = await page.evaluate(() => ({
    title: document.title,
    currentPage: document.querySelector("#meta")?.textContent ?? "",
    imageCount: document.querySelectorAll(".screen img").length,
    hotspotCount: document.querySelectorAll(".hotspot").length,
    aiVisible: getComputedStyle(document.querySelector("#aiPanel")).display !== "none",
  }));

  await mkdir(join(root, "artifacts"), { recursive: true });
  await page.screenshot({ fullPage: false, path: join(root, "artifacts", "preview-home.png") });

  await page.locator('button[data-index="12"]').click();
  await page.waitForLoadState("networkidle");
  result.afterRecognitionClick = await page.evaluate(() => ({
    currentPage: document.querySelector("#meta")?.textContent ?? "",
    imageCount: document.querySelectorAll(".screen img").length,
    hotspotCount: document.querySelectorAll(".hotspot").length,
    aiVisible: getComputedStyle(document.querySelector("#aiPanel")).display !== "none",
  }));

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
} finally {
  server.kill();
}

async function waitFor(url) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}
