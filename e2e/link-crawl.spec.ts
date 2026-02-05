import { test, expect } from "@playwright/test";

test.setTimeout(Number(process.env.LINK_CRAWL_TIMEOUT_MS ?? 180000));


const MAX_DEPTH = Number(process.env.LINK_CRAWL_DEPTH ?? 3);
const MAX_PAGES = Number(process.env.LINK_CRAWL_MAX_PAGES ?? 200);
const WAIT_AFTER_NAV_MS = Number(process.env.LINK_CRAWL_WAIT_MS ?? 250);

function normalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.hash = "";
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

function shouldSkipHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("#")) return true;
  if (trimmed.startsWith("mailto:")) return true;
  if (trimmed.startsWith("tel:")) return true;
  if (trimmed.startsWith("javascript:")) return true;
  if (trimmed.startsWith("data:")) return true;
  if (trimmed.startsWith("blob:")) return true;
  return false;
}

function isSameOrigin(rawUrl: string, origin: string): boolean {
  try {
    return new URL(rawUrl).origin === origin;
  } catch {
    return false;
  }
}

test("crawl internal links", async ({ page }, testInfo) => {
  const baseURL =
    (testInfo.project.use as { baseURL?: string })?.baseURL ||
    process.env.PLAYWRIGHT_BASE_URL;

  if (!baseURL) {
    throw new Error("No baseURL configured for link crawl test");
  }

  const origin = new URL(baseURL).origin;
  const queue: Array<{ url: string; depth: number }> = [
    { url: baseURL, depth: 0 },
  ];
  const visited = new Set<string>();

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const current = queue.shift();
    if (!current) break;

    const normalized = normalizeUrl(current.url);
    if (visited.has(normalized)) continue;

    const response = await page.goto(current.url, {
      waitUntil: "domcontentloaded",
    });

    expect(response, `No response for ${current.url}`).not.toBeNull();
    const status = response?.status() ?? 0;
    expect(status, `Bad status ${status} for ${current.url}`).toBeLessThan(500);

    visited.add(normalized);

    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    if (WAIT_AFTER_NAV_MS > 0) {
      await page.waitForTimeout(WAIT_AFTER_NAV_MS);
    }

    if (current.depth >= MAX_DEPTH) continue;

    const links = await page.$$eval("a[href]", (elements) =>
      elements
        .map((el) => el.getAttribute("href") || "")
        .filter(Boolean)
    );

    for (const href of links) {
      if (shouldSkipHref(href)) continue;
      let absolute = href;
      try {
        absolute = new URL(href, current.url).toString();
      } catch {
        continue;
      }

      if (!isSameOrigin(absolute, origin)) continue;

      const normalizedChild = normalizeUrl(absolute);
      if (visited.has(normalizedChild)) continue;

      queue.push({ url: absolute, depth: current.depth + 1 });
    }
  }

  expect(visited.size, "No pages were visited during link crawl").toBeGreaterThan(0);
});
