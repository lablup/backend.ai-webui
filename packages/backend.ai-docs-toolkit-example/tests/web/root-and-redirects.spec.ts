import { test, expect } from "@playwright/test";

// FR-2753: visiting `/` resolves to a real language landing without 404,
// without an infinite redirect, and without rendering a placeholder shell
// the user can perceive.

test("root index resolves and lands inside the latest version", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBeLessThan(400);
  // Wait for the redirect script to do its thing.
  await page.waitForURL(/\/(0\.1|next)\/(en|ko)\/index\.html$/);
  // The landing page is the per-language Home page (FR-2737), not the
  // legacy meta-refresh stub — it has the home-hero section.
  await expect(page.locator(".home-hero")).toBeVisible();
});

test("root index respects localStorage `lang` (sticky preference)", async ({ page }) => {
  // Pre-seed localStorage on the same origin before the redirect script runs.
  await page.addInitScript(() => {
    window.localStorage.setItem("lang", "ko");
  });
  await page.goto("/");
  await page.waitForURL(/\/(0\.1|next)\/ko\/index\.html$/);
});

test("noscript fallback list is present on the root page", async ({ page, browser }) => {
  // The auto-redirect script runs on first paint, so plain `goto` would
  // already navigate us off `/`. Use a JS-disabled context so the script
  // never fires and we can assert on `/`'s markup directly.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await ctx.newPage();
  try {
    await p2.goto("/");
    const noscriptHtml = await p2.locator("noscript").first().innerHTML();
    // The fallback list is one `<a>` per supported language. The href
    // includes the version prefix (`./0.1/en/index.html`) when versions
    // are declared.
    expect(noscriptHtml).toMatch(/<a [^>]*href="\.\/(?:[\w.]+\/)?(?:en|ko)\/index\.html"/);
  } finally {
    await ctx.close();
  }
});

test("root index has no topbar/sidebar in its server-rendered markup (FR-2753)", async ({
  browser,
}) => {
  // JS-disabled context guarantees we observe the static `/` markup
  // before the redirect runs.
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await ctx.newPage();
  try {
    await p2.goto("/");
    expect(await p2.locator(".bai-topbar").count()).toBe(0);
    expect(await p2.locator(".doc-sidebar").count()).toBe(0);
  } finally {
    await ctx.close();
  }
});
