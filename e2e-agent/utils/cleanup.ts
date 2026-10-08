import { type Browser, test as base } from "@e2e-dev/web";
import { type App, expect } from "e2e";

const isClientReady = (browser: Browser) =>
  browser
    .evaluate(() => (globalThis as any).backendaiclient?.ready === true)
    .catch(() => false);

// A failed test can leave the page off the app or mid-navigation.
async function ensureClient(app: App, browser: Browser) {
  if (await isClientReady(browser)) return;
  await app.open("/summary");
  await expect
    .poll(() => isClientReady(browser), { timeout: 15_000 })
    .toBe(true);
}

async function destroySession(browser: Browser, name: string) {
  return browser
    .evaluate(async (sessionName: string) => {
      try {
        await (globalThis as any).backendaiclient.destroy(sessionName);
        return "terminated";
      } catch (e: any) {
        if (e?.statusCode === 404) return "already gone";
        return `failed: ${e?.statusCode} ${e?.title ?? e?.msg ?? e}`;
      }
    }, name)
    .catch((e) => `failed: ${e}`);
}

export async function terminateSession(
  app: App,
  browser: Browser,
  name: string,
) {
  let result = await destroySession(browser, name);
  // A navigation can destroy the page context mid-evaluate; retry once.
  if (/context was destroyed|navigation/i.test(result)) {
    await ensureClient(app, browser).catch(() => {});
    result = await destroySession(browser, name);
  }
  console.log(`[cleanup] ${name}: ${result}`);
}

export const test = base.extend<{ sessionsToCleanup: string[] }>({
  sessionsToCleanup: async ({ app, browser }, use) => {
    const names: string[] = [];
    await use(names);
    if (names.length === 0) return;
    try {
      await ensureClient(app, browser);
    } catch (e) {
      console.log(`[cleanup] the app client never became ready: ${e}`);
      return;
    }
    for (const name of names) {
      await terminateSession(app, browser, name);
    }
  },
});
