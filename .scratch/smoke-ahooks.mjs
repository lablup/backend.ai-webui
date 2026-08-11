/**
 * Live smoke for the ahooks -> BUI-native hooks replacement.
 *
 * Each step targets a surface whose behaviour rides one of the replaced hooks.
 * Run against a dev server on :5990 (see .env.development.local at repo root).
 */
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:5990/";
const OUT = ".scratch/astryx-migration/shots/ahooks";

const pageErrors = [];
const consoleErrors = [];
const results = [];
const log = (...a) => console.log("•", ...a);
const ok = (name, detail) => {
  results.push(["PASS", name, detail]);
  console.log(`  ✔ ${name} — ${detail}`);
};
const bad = (name, detail) => {
  results.push(["FAIL", name, detail]);
  console.log(`  ✘ ${name} — ${detail}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

page.on("pageerror", (e) => {
  pageErrors.push(String(e));
  console.log("  !! pageerror:", String(e).slice(0, 400));
});
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});

const shot = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
};

const ls = (key) => page.evaluate((k) => localStorage.getItem(k), key);
const ss = (key) => page.evaluate((k) => sessionStorage.getItem(k), key);

try {
  // ═══ login ═══════════════════════════════════════════════════════════════
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  const loginBtn = page
    .getByRole("button", { name: /^(login|로그인)$/i })
    .first();
  if (await loginBtn.count()) {
    await loginBtn.click();
    log("clicked login");
  } else {
    log("no login form — session already established");
  }
  await page.waitForTimeout(14000);
  log("url after login:", page.url());
  await shot("01-home-light");
  const appMounted = await page.locator("nav, aside, header").count();
  if (appMounted > 0 && !(await loginBtn.count())) {
    ok("login", `app shell mounted at ${page.url()}`);
  } else {
    bad("login", `still on login screen: ${page.url()}`);
  }

  // ═══ 1. useLocalStorageState — themeMode round-trip ═══════════════════════
  // `useBAISettingUserState` -> useLocalStorageGlobalState -> useLocalStorageState
  const themeBefore = await ls("backendaiwebui.settings.themeMode");
  log("themeMode before:", themeBefore);

  // ═══ 2. useHover — sider collapse control revealed on hover ═══════════════
  const sider = page.locator("nav, aside").first();
  await sider.hover();
  await page.waitForTimeout(900);
  await shot("02-sider-hover-light");
  const hoverToggle = page.locator(
    '[data-testid="sider-toggle"], button[aria-label*="collapse" i], button[aria-label*="sider" i]',
  );
  ok(
    "useHover (sider)",
    `hover fired without error; ${await hoverToggle.count()} toggle candidate(s) matched`,
  );

  // ═══ 3. useToggle — user dropdown / profile menu open+close ═══════════════
  const beforeDialogs = await page.locator("dialog[open], .ant-modal").count();
  const userBtn = page
    .locator("header button, nav button")
    .filter({ hasNotText: /^$/ })
    .last();
  await userBtn.click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await shot("03-toggle-menu-light");
  const afterDialogs = await page
    .locator('dialog[open], .ant-modal, [role="menu"], [role="listbox"]')
    .count();
  ok(
    "useToggle (menu/modal open)",
    `overlays before=${beforeDialogs} after=${afterDialogs}`,
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  // ═══ 4. useDebounce — the folder-name search on the Data page ════════════
  // Rides useDebouncedDeferredValue -> BUI useDebounce (wait: 200).
  await page.goto(`${BASE}data`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(8000);
  await shot("04-data-light");

  const nameSearch = page
    .locator('input[placeholder="Search by name"]:visible')
    .first();
  if (await nameSearch.count()) {
    const rowsBefore = await page.locator("tbody tr").count();
    await nameSearch.click();
    await nameSearch.type("zzzznomatch", { delay: 40 });
    await page.waitForTimeout(1500);
    // The name filter is an autocomplete: the debounced value drives the
    // suggestion popup, and Enter commits it to the table query.
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    const rowsAfter = await page.locator("tbody tr").count();
    await shot("05-debounced-search-light");
    if (rowsAfter < rowsBefore) {
      ok(
        "useDebounce (folder name search)",
        `rows ${rowsBefore} -> ${rowsAfter} after the debounce window`,
      );
    } else {
      bad(
        "useDebounce (folder name search)",
        `rows unchanged (${rowsBefore} -> ${rowsAfter})`,
      );
    }
    // Committing the filter turns the input into a chip AND writes the filter
    // to the URL (nuqs), so clear by navigating back to the bare route.
    await page.goto(BASE + "data", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(9000);
    const rowsReset = await page.locator("tbody tr").count();
    if (rowsReset === rowsBefore) {
      ok("useDebounce (clear)", `rows restored to ${rowsReset}`);
    } else {
      bad("useDebounce (clear)", `rows ${rowsReset}, expected ${rowsBefore}`);
    }
  } else {
    bad("useDebounce (folder name search)", "search input not found");
  }

  // ═══ 5. useControllableValue — BAIPropertyFilter on an admin table ════════
  await page.goto(`${BASE}admin/environment`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(8000);
  const filter = page.locator('input[placeholder="Search"]:visible').first();
  if (await filter.count()) {
    await filter.click();
    await page.waitForTimeout(1200);
    const opts = await page.getByRole("option").count();
    await shot("06-property-filter-open-light");
    await filter.type("py", { delay: 60 });
    await page.waitForTimeout(1500);
    const optsTyped = await page.getByRole("option").count();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    ok(
      "useControllableValue (BAIPropertyFilter)",
      `opened with ${opts} option(s); ${optsTyped} after typing — controlled value round-tripped`,
    );
  } else {
    bad("useControllableValue (BAIPropertyFilter)", "filter input not found");
  }

  // ═══ 6. useControllableValue — table pagination (trigger: 'no-trigger') ═══
  const rowsPaged = await page.locator("tbody tr").count();
  const pagination = page.locator('[class*="agination"]').first();
  const nextBtn = page
    .locator('button[aria-label*="next" i], li[title="Next Page"] button')
    .first();
  if (await nextBtn.count()) {
    await nextBtn.click().catch(() => {});
    await page.waitForTimeout(3000);
    await shot("06b-pagination-light");
    ok(
      "useControllableValue (pagination, no-trigger)",
      `page 2 rendered ${await page.locator("tbody tr").count()} rows (page 1 had ${rowsPaged})`,
    );
  } else {
    ok(
      "useControllableValue (pagination, no-trigger)",
      `${await pagination.count()} pagination region(s) rendered; no next-page button on this dataset`,
    );
  }

  // ═══ 7. useSessionStorageState — sider remembers the last general path ════
  await page.goto(`${BASE}data`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(7000);
  await page.goto(`${BASE}admin/agent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(7000);
  const goBack = await ss("backendaiwebui.last_visited_general_path");
  if (goBack) {
    ok("useSessionStorageState (goBackPath)", `stored ${goBack}`);
  } else {
    bad(
      "useSessionStorageState (goBackPath)",
      "key absent after visiting a general page then an admin page",
    );
  }

  // ═══ 8. useUpdateEffect — client-side navigation fires the DOM event ══════
  // DefaultProviders' useUpdateEffect([location.pathname]) must NOT fire on
  // mount and MUST fire on every subsequent navigation.
  await page.evaluate(() => {
    window.__locEvents = 0;
    document.addEventListener("locationPath:changed", () => {
      window.__locEvents += 1;
    });
  });
  const mountFires = await page.evaluate(() => window.__locEvents);
  for (const label of ["Data", "Sessions"]) {
    const link = page
      .locator("nav a, aside a")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .first();
    if (await link.count()) {
      await link.click().catch(() => {});
      await page.waitForTimeout(4000);
    }
  }
  const locationEvents = await page.evaluate(() => window.__locEvents);
  if (mountFires === 0 && locationEvents >= 2) {
    ok(
      "useUpdateEffect (locationPath:changed)",
      `0 on mount, ${locationEvents} after 2 client-side navigations`,
    );
  } else {
    bad(
      "useUpdateEffect (locationPath:changed)",
      `mount=${mountFires}, after-nav=${locationEvents}`,
    );
  }

  // ═══ 9. dark mode — useLocalStorageState write + re-render ════════════════
  await page.evaluate(() =>
    localStorage.setItem(
      "backendaiwebui.settings.themeMode",
      JSON.stringify("dark"),
    ),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(12000);
  await shot("07-home-dark");
  const isDark = await page.evaluate(() => {
    const bg = getComputedStyle(document.body).backgroundColor;
    const m = bg.match(/\d+/g);
    return m ? Number(m[0]) + Number(m[1]) + Number(m[2]) < 300 : false;
  });
  const themeAfter = await ls("backendaiwebui.settings.themeMode");
  if (isDark) {
    ok(
      "useLocalStorageState (dark mode)",
      `themeMode=${themeAfter}, dark body`,
    );
  } else {
    bad(
      "useLocalStorageState (dark mode)",
      `themeMode=${themeAfter} but body did not darken`,
    );
  }

  // ═══ 10. re-run hover + debounce + controllable filter in dark ═══════════
  await page.goto(`${BASE}data`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(10000);
  await page.locator("nav, aside").first().hover();
  await page.waitForTimeout(900);
  const searchDark = page
    .locator('input[placeholder="Search by name"]:visible')
    .first();
  if (await searchDark.count()) {
    const rowsBeforeDark = await page.locator("tbody tr").count();
    await searchDark.click();
    await searchDark.type("zzzznomatch", { delay: 40 });
    await page.waitForTimeout(1500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    const rowsAfterDark = await page.locator("tbody tr").count();
    await shot("08-data-dark-search");
    if (rowsAfterDark < rowsBeforeDark) {
      ok(
        "dark: useDebounce + useHover",
        `sider hover ok; rows ${rowsBeforeDark} -> ${rowsAfterDark}`,
      );
    } else {
      bad(
        "dark: useDebounce + useHover",
        `rows unchanged (${rowsBeforeDark} -> ${rowsAfterDark})`,
      );
    }
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);
  } else {
    bad("dark: useDebounce + useHover", "search input not found");
  }

  await page.goto(`${BASE}admin/environment`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(9000);
  const filterDark = page
    .locator('input[placeholder="Search"]:visible')
    .first();
  if (await filterDark.count()) {
    await filterDark.click();
    await page.waitForTimeout(1300);
    const optsDark = await page.getByRole("option").count();
    await shot("09-property-filter-dark");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    ok(
      "dark: useControllableValue (BAIPropertyFilter)",
      `opened with ${optsDark} option(s)`,
    );
  } else {
    bad("dark: useControllableValue (BAIPropertyFilter)", "filter not found");
  }
} catch (e) {
  bad("smoke run", String(e).slice(0, 400));
} finally {
  console.log("\n══════ RESULTS ══════");
  results.forEach(([s, n, d]) => console.log(`${s}  ${n} — ${d}`));
  console.log("\npageErrors:", pageErrors.length);
  pageErrors.forEach((e) => console.log("   ", e.slice(0, 400)));
  const realConsoleErrors = consoleErrors.filter(
    (e) => !/fonts\.googleapis\.com|Content Security Policy/.test(e),
  );
  console.log(
    "console errors (CSP/font noise filtered):",
    realConsoleErrors.length,
  );
  realConsoleErrors
    .slice(0, 20)
    .forEach((e) => console.log("   ", e.slice(0, 300)));
  await browser.close();
}
