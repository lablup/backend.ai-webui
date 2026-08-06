import { chromium } from "@playwright/test";

const label = process.argv[2];
const OUT = "/tmp/spike-shots";
const b = await chromium.launch();
const errs = [];
for (const mode of ["light", "dark"]) {
  const ctx = await b.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: mode,
  });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push("[pageerror] " + e.message));
  p.on("console", (m) => {
    if (m.type() === "error") errs.push("[console] " + m.text().slice(0, 200));
  });
  await p.addInitScript((m) => {
    localStorage.setItem(
      "backendaiwebui.settings.themeMode",
      JSON.stringify(m),
    );
  }, mode);
  for (const [view, path] of [
    ["login", "/"],
    ["routeerror", "/no-such-route"],
  ]) {
    await p.goto("http://127.0.0.1:5199" + path, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `${OUT}/${label}-${view}-${mode}.png` });
  }
  const dump = await p.evaluate(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const probe = (v, prop) => {
      el.style.cssText = "";
      el.style.setProperty(prop, `var(${v})`);
      const cs = getComputedStyle(el);
      return prop === "color" ? cs.color : cs.paddingTop;
    };
    const out = {
      spacing3: probe("--spacing-3", "padding-top"),
      radiusInner: probe("--radius-inner", "padding-top"),
      textPrimary: probe("--color-text-primary", "color"),
      bgSurface: probe("--color-background-surface", "color"),
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      dataTheme: document.documentElement.getAttribute("data-theme"),
      astryxTheme: document.documentElement.getAttribute("data-astryx-theme"),
    };
    el.remove();
    return out;
  });
  console.log(label, mode, JSON.stringify(dump));
  await ctx.close();
}
await b.close();
console.log(
  errs.length
    ? "ERRORS(" +
        errs.length +
        "):\n" +
        [...new Set(errs)].slice(0, 8).join("\n")
    : "no console/page errors",
);
