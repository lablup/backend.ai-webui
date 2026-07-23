import { test, expect } from "@playwright/test";

// This file is project-scoped to `mobile-chromium` (Pixel 5) by the
// playwright config — the assertions below apply to a viewport ≤ 768px.

test("hamburger button is visible on mobile and the sidebar is hidden by default", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  const hamburger = page.locator(".bai-topbar__menu");
  await expect(hamburger).toBeVisible();
  // Sidebar exists in the DOM but is collapsed off-canvas on mobile;
  // assertions on visibility check the actual computed style.
  const sidebar = page.locator(".doc-sidebar");
  await expect(sidebar).toBeHidden();
});

test("clicking the hamburger toggles the drawer open and closed", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  const hamburger = page.locator(".bai-topbar__menu");
  const sidebar = page.locator(".doc-sidebar");
  // Open
  await hamburger.click();
  await expect(sidebar).toBeVisible();
  // Close (clicking the hamburger again, or any close affordance the
  // drawer surfaces, should hide the sidebar).
  await hamburger.click();
  await expect(sidebar).toBeHidden();
});

test("topbar brand and search controls remain reachable on mobile", async ({
  page,
}) => {
  await page.goto("/0.1/en/quickstart.html");
  await expect(page.locator(".bai-topbar__brand")).toBeVisible();
  // The mobile search button (compact icon variant) is what's exposed at
  // narrow widths — the wide search bar collapses.
  await expect(page.locator(".bai-topbar__searchicon")).toBeVisible();
});
