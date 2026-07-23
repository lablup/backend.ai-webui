import { test, expect } from "@playwright/test";

test("language switcher is present on every page", async ({ page }) => {
  for (const url of [
    "/0.1/en/index.html",
    "/0.1/en/quickstart.html",
    "/0.1/ko/quickstart.html",
  ]) {
    await page.goto(url);
    await expect(page.locator(".lang-switcher__select")).toBeVisible();
  }
});

test("switching language navigates to the same chapter slug in the peer language", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  await page.locator(".lang-switcher__select").selectOption("../ko/quickstart.html");
  await page.waitForURL(/\/0\.1\/ko\/quickstart\.html$/);
  // Confirm we are on the Korean version: the H1 is in Korean.
  await expect(page.locator("h1")).toContainText("빠른 시작");
});

test("hreflang tags cover both languages plus x-default", async ({ page }) => {
  await page.goto("/0.1/en/quickstart.html");
  // Read the alternate <link rel> entries.
  const hreflangs = await page.$$eval(
    'link[rel="alternate"][hreflang]',
    (links) => links.map((l) => l.getAttribute("hreflang")),
  );
  expect(hreflangs).toContain("en");
  expect(hreflangs).toContain("ko");
  expect(hreflangs).toContain("x-default");
});

test("the current language is selected in the switcher dropdown", async ({ page }) => {
  await page.goto("/0.1/ko/quickstart.html");
  const selectedLang = await page
    .locator(".lang-switcher__select option[selected]")
    .first()
    .getAttribute("lang");
  expect(selectedLang).toBe("ko");
});
