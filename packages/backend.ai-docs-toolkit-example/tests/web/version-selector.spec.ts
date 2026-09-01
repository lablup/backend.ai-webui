import { test, expect } from "@playwright/test";

test("version selector shows both declared versions", async ({ page }) => {
  await page.goto("/0.1/en/quickstart.html");
  const select = page.locator("#version-switcher");
  await expect(select).toBeVisible();
  const optionValues = await select.locator("option").evaluateAll((opts) =>
    opts.map((o) => (o as HTMLOptionElement).value),
  );
  expect(optionValues).toContain("next");
  expect(optionValues).toContain("0.1");
});

test("the current version is marked as `selected` and labeled `(latest)` when applicable", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  const selected = await page
    .locator("#version-switcher option:checked")
    .first();
  await expect(selected).toHaveAttribute("value", "0.1");
  // Selected entry is the `latest: true` one — its label includes a marker.
  await expect(selected).toHaveText(/0\.1.*latest/i);
});

test("switching to another version navigates to the same slug in that version", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  await page.locator("#version-switcher").selectOption("next");
  await page.waitForURL(/\/next\/en\/quickstart\.html$/);
  // Same chapter, different version.
  await expect(page.locator("h1")).toContainText("Quickstart");
});

test("switching versions never leaves the user on a 404 (slug-preserving when present, otherwise index)", async ({
  page,
}) => {
  // Both versions in the example expose the same slugs (they share the
  // workspace source), so this test does NOT exercise the "missing slug"
  // branch deterministically — that requires a fixture where one version
  // genuinely lacks a chapter, which is intentionally out of scope here.
  // The assertion guards the looser invariant the example CAN verify:
  // the destination is a real `(<slug>|index).html` page, never a 404
  // shell. A separate fixture-divergent test belongs to a follow-up.
  await page.goto("/0.1/en/about.html");
  await page.locator("#version-switcher").selectOption("next");
  await page.waitForURL(/\/next\/en\/(about|index)\.html$/);
  expect(page.url()).not.toContain("404");
});
