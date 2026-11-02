import type { Browser } from "@e2e-dev/web";

/** `{ section: { key: value } }`; a string value is written as a TOML string. */
export type ConfigTomlOverrides = Record<
  string,
  Record<string, string | boolean>
>;

const tomlValue = (value: string | boolean) =>
  typeof value === "boolean" ? String(value) : JSON.stringify(value);

/** Sets each key in its `[section]`, replacing the key's existing lines. */
export function applyConfigTomlOverrides(
  text: string,
  overrides: ConfigTomlOverrides,
) {
  let lines = text.split("\n");
  for (const [section, entries] of Object.entries(overrides)) {
    const header = lines.findIndex((line) => line.trim() === `[${section}]`);
    if (header === -1) {
      lines.push("", `[${section}]`);
      for (const [key, value] of Object.entries(entries)) {
        lines.push(`${key} = ${tomlValue(value)}`);
      }
      continue;
    }
    let end = lines.findIndex((line, i) => i > header && /^\s*\[/.test(line));
    if (end === -1) end = lines.length;
    const keys = Object.keys(entries);
    const body = lines
      .slice(header + 1, end)
      .filter(
        (line) =>
          !keys.some((key) => new RegExp(`^\\s*${key}\\s*=`).test(line)),
      );
    lines = [
      ...lines.slice(0, header + 1),
      ...keys.map((key) => `${key} = ${tomlValue(entries[key])}`),
      ...body,
      ...lines.slice(end),
    ];
  }
  return lines.join("\n");
}

/**
 * Serves every config.toml the page loads with `overrides()` applied, read
 * per request so a test can change it and reload. The webserver's
 * config.toml is merged over the app's at login, so both are patched.
 */
export async function overrideConfigToml(
  browser: Browser,
  overrides: () => ConfigTomlOverrides,
) {
  const originals = new Map<string, Promise<string | null>>();
  await browser.route(/\/config\.toml(\?|$)/, async (route) => {
    const url = route.request.url;
    if (!originals.has(url)) {
      originals.set(
        url,
        fetch(url, { cache: "no-store" })
          .then((res) => (res.ok ? res.text() : null))
          .catch(() => null),
      );
    }
    const original = await originals.get(url);
    if (original === null || original === undefined) {
      await route.continue();
      return;
    }
    await route.fulfill({
      body: applyConfigTomlOverrides(original, overrides()),
      contentType: "text/plain",
      headers: { "access-control-allow-origin": "*" },
    });
  });
}
