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

// Status of the caller's vfolder named `name`, or "absent" when there is none.
export async function vfolderStatus(browser: Browser, name: string) {
  return browser.evaluate(async (folderName: string) => {
    const folders: any[] = await (
      globalThis as any
    ).backendaiclient.vfolder.list();
    const matches = folders.filter((f) => f.name === folderName);
    if (matches.length === 0) return "absent";
    const live = matches.find(
      (f) =>
        !/^(delete-ongoing|delete-complete|deleted|purge-ongoing)$/.test(
          f.status,
        ),
    );
    return String((live ?? matches[0]).status);
  }, name);
}

async function purgeVFolder(browser: Browser, name: string) {
  return browser
    .evaluate(async (folderName: string) => {
      const client = (globalThis as any).backendaiclient;
      const find = async () =>
        ((await client.vfolder.list()) as any[]).find(
          (f) =>
            f.name === folderName &&
            !/^(delete-ongoing|delete-complete|deleted|purge-ongoing)$/.test(
              f.status,
            ),
        );
      try {
        let folder = await find();
        if (!folder) return "already gone";
        if (folder.status === "ready") {
          await client.vfolder.delete_by_id(folder.id);
          for (let i = 0; i < 10; i++) {
            folder = await find();
            if (!folder || folder.status !== "ready") break;
            await new Promise((r) => setTimeout(r, 1000));
          }
          if (!folder) return "already gone";
        }
        await client.vfolder.delete_from_trash_bin(folder.id);
        return "purged";
      } catch (e: any) {
        return `failed: ${e?.statusCode} ${e?.title ?? e?.msg ?? e}`;
      }
    }, name)
    .catch((e) => `failed: ${e}`);
}

export const test = base.extend<{
  sessionsToCleanup: string[];
  vfoldersToCleanup: string[];
}>({
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
  vfoldersToCleanup: async ({ app, browser }, use) => {
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
      let result = await purgeVFolder(browser, name);
      if (/context was destroyed|navigation/i.test(result)) {
        await ensureClient(app, browser).catch(() => {});
        result = await purgeVFolder(browser, name);
      }
      console.log(`[cleanup] vfolder ${name}: ${result}`);
    }
  },
});
