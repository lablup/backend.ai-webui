import { test, expect } from "@playwright/test";

// Regression coverage for the Cmd-K / Ctrl-K search palette.
//
// Two independent bugs were fixed here and both are guarded below:
//
//  1. search.js and interactions.js each registered a document-level
//     Cmd-K handler. search.js is emitted first (both `defer`, so
//     document order == execution order), so it won the event, called
//     preventDefault(), and then focused an input that lives inside the
//     `hidden` palette — a no-op. interactions.js, the actual palette
//     owner, then bailed on its `!e.defaultPrevented` guard. The
//     shortcut did nothing at all, in every language.
//
//  2. Both handlers matched on `e.key === "k"`, which is the *character
//     the layout/IME produced*. With a Hangul IME active `e.key` is
//     "ㅏ", so the shortcut stopped matching entirely. Shortcuts now
//     fall back to the physical key (`e.code === "KeyK"`).

const PAGE = "/0.1/en/quickstart.html";

const palette = ".bai-palette";

test("Cmd-K / Ctrl-K opens the search palette and focuses the input", async ({
  page,
}) => {
  await page.goto(PAGE);
  await expect(page.locator(palette)).toBeHidden();

  await page.keyboard.press("ControlOrMeta+k");

  await expect(page.locator(palette)).toBeVisible();
  await expect(page.locator("#search-input")).toBeFocused();
});

test("Escape closes the palette again", async ({ page }) => {
  await page.goto(PAGE);
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.locator(palette)).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.locator(palette)).toBeHidden();
});

test("clicking the topbar search trigger opens the palette", async ({
  page,
}) => {
  await page.goto(PAGE);
  await page.locator("[data-search-trigger]").first().click();
  await expect(page.locator(palette)).toBeVisible();
  await expect(page.locator("#search-input")).toBeFocused();
});

test("`/` opens the palette when not typing in a field", async ({ page }) => {
  await page.goto(PAGE);
  await page.keyboard.press("/");
  await expect(page.locator(palette)).toBeVisible();
});

// `/` is a bare printable shortcut, so it matches on the produced
// character — never on the physical key. "?" sits on the same physical
// `Slash` key but is not the shortcut. Routing `/` through the
// physical-key fallback would open the palette on every question mark.
//
// Press "?" rather than "Shift+/": Playwright applies no shift-layout
// translation to a chord, so `press("Shift+/")` reports key "/" and
// tests nothing. `press("?")` reports key "?" with code "Slash" — the
// same shape a real US-layout keyboard produces.
test("`?` (same physical key as `/`) does not open the palette", async ({
  page,
}) => {
  await page.goto(PAGE);
  await page.keyboard.press("?");
  await expect(page.locator(palette)).toBeHidden();
});

// Playwright's keyboard API always reports a `key` consistent with a US
// layout, so an IME cannot be driven directly. Dispatching the event
// shape a Hangul IME actually produces — physical `KeyK`, but `key` set
// to the composed jamo — is the only way to pin this regression.
test("Cmd-K works while a Hangul IME is active (key is a jamo, not 'k')", async ({
  page,
}) => {
  await page.goto(PAGE);
  await expect(page.locator(palette)).toBeHidden();

  await page.evaluate(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ㅏ", // what a Hangul IME reports for the physical K key
        code: "KeyK",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  await expect(page.locator(palette)).toBeVisible();
});

test("Cmd-K works when the IME reports the composition placeholder", async ({
  page,
}) => {
  await page.goto(PAGE);

  await page.evaluate(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Process", // reported mid-composition by some browsers
        code: "KeyK",
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  await expect(page.locator(palette)).toBeVisible();
});

// The inverse guard: falling back to the physical key must not make
// unrelated Latin-layout keys trigger the shortcut. A Dvorak user
// pressing the key labeled "V" sits on physical `KeyK`, but produces
// "v" — a Latin letter, so `e.key` is trusted and this must NOT open.
test("Ctrl + a Latin letter that is not 'k' does not open the palette", async ({
  page,
}) => {
  await page.goto(PAGE);

  await page.evaluate(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "v",
        code: "KeyK",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });

  await expect(page.locator(palette)).toBeHidden();
});
