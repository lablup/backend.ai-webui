import { test, expect } from "@playwright/test";

test("grouped sidebar renders one <details> per category", async ({ page }) => {
  await page.goto("/0.1/en/quickstart.html");
  const groups = page.locator("details.doc-sidebar-group");
  await expect(groups).toHaveCount(2); // Getting Started, Reference
  // Labels match the example's book.config.yaml.
  const labels = await groups.locator(".doc-sidebar-group__label").allTextContents();
  expect(labels).toEqual(["Getting Started", "Reference"]);
});

test("the active page's category group is open by default", async ({ page }) => {
  await page.goto("/0.1/en/quickstart.html");
  // Quickstart is in "Getting Started" — that group should be `[open]`.
  const gettingStarted = page
    .locator("details.doc-sidebar-group")
    .filter({ has: page.getByText("Getting Started", { exact: true }) });
  await expect(gettingStarted).toHaveAttribute("open", "");
});

test("each group displays its page count", async ({ page }) => {
  await page.goto("/0.1/en/quickstart.html");
  const counts = await page
    .locator(".doc-sidebar-group__count")
    .allTextContents();
  // Both groups in the example have exactly 2 pages.
  expect(counts).toEqual(["2", "2"]);
});

test("breadcrumb shows category and current page", async ({ page }) => {
  await page.goto("/0.1/en/features.html");
  const breadcrumb = page.locator(".breadcrumb");
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb).toContainText("Getting Started");
  await expect(breadcrumb).toContainText("Features");
});

test("right-rail TOC lists the page's H2 headings", async ({ page }) => {
  await page.goto("/0.1/en/features.html");
  const toc = page.locator(".doc-toc");
  await expect(toc).toBeVisible();
  // Features has three H2 headings: Admonitions, Code blocks, Images.
  await expect(toc).toContainText("Admonitions");
  await expect(toc).toContainText("Code blocks");
  await expect(toc).toContainText("Images");
});

test("scroll-spy promotes the in-view heading to the active TOC entry", async ({
  page,
}) => {
  await page.goto("/0.1/en/features.html");
  // Resolve the actual H2 id (slug prefix varies per chapter).
  const codeBlocksId = await page
    .locator("h2", { hasText: "Code blocks" })
    .getAttribute("id");
  expect(codeBlocksId).toBeTruthy();
  // Position the heading near the top of the viewport so the
  // IntersectionObserver in toc-scrollspy.js fires deterministically.
  await page.evaluate((id) => {
    const el = document.getElementById(id!);
    if (!el) throw new Error(`heading #${id} not found`);
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
  }, codeBlocksId);
  await expect(
    page.locator(`.doc-toc a[href="#${codeBlocksId}"]`),
  ).toHaveClass(/is-active/, { timeout: 5_000 });
});

test("sidebar links navigate to the right chapter (after expanding the group)", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  // "Customization" is in the "Reference" group, which is collapsed by
  // default for non-active groups. Open it first.
  await page
    .locator(".doc-sidebar-group__summary", { hasText: "Reference" })
    .click();
  await page.locator(".doc-sidebar a", { hasText: "Customization" }).click();
  await page.waitForURL(/\/0\.1\/en\/customization\.html$/);
  await expect(page.locator("h1")).toContainText("Customization");
});
