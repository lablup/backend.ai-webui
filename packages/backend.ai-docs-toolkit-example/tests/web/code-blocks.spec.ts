import { test, expect } from "@playwright/test";

test("code blocks render with Shiki line spans (build-time tokenization)", async ({
  page,
}) => {
  await page.goto("/0.1/en/features.html");
  // Shiki emits one `<span class="line">` per source line. The page has
  // multiple code blocks; assert at least one rendered line exists.
  const lines = page.locator("pre code .line");
  await expect(lines.first()).toBeVisible();
});

test("each code block gets a Copy button after the code-copy script hydrates", async ({
  page,
}) => {
  await page.goto("/0.1/en/features.html");
  // Copy button selector matches the class set by code-copy.js.
  const copyButtons = page.locator(".doc-code-copy-btn");
  // Wait for hydration — the script injects buttons after DOMContentLoaded.
  await expect(copyButtons.first()).toBeAttached({ timeout: 5_000 });
  // ts + shellsession + bash = at least 3 code blocks.
  const count = await copyButtons.count();
  expect(count).toBeGreaterThanOrEqual(3);
});

test("clicking Copy puts the source on the clipboard", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/0.1/en/features.html");
  const firstCopy = page.locator(".doc-code-copy-btn").first();
  await firstCopy.waitFor({ state: "attached", timeout: 5_000 });
  await firstCopy.click();
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  // The first code block is the TS import snippet.
  expect(clipText).toContain("import");
  expect(clipText).toContain("backend.ai-docs-toolkit");
});

test("shellsession blocks strip `$` prompts from the copied text (FR-2756)", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/0.1/en/features.html");
  // Find the shellsession-language wrapper specifically by its language label.
  const shellWrapper = page
    .locator(".code-block-wrapper")
    .filter({ has: page.locator(".code-block-lang", { hasText: "shellsession" }) });
  const copyBtn = shellWrapper.locator(".doc-code-copy-btn");
  await copyBtn.waitFor({ state: "attached", timeout: 5_000 });
  await copyBtn.click();
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain("docs-toolkit build:web");
  // No line starts with the `$ ` prompt the source had.
  expect(clipText).not.toMatch(/^\$\s/m);
});
