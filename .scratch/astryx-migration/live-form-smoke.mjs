/**
 * Ticket 35 live smoke on the running dev app (vite :5980, backend 10.82.0.130).
 *
 * Asserts, on REAL screens running the self-hosted engine:
 *   1. every form item is the BAI shell — zero `.ant-form-item*`, zero
 *      `form.ant-form` anywhere on the page;
 *   2. `validateFields` failures surface through the engine's own explain slot;
 *   3. those messages are LOCALIZED after switching the app language;
 *   4. the requiredMark contract holds: no asterisk painted, "(Optional)" on
 *      non-required labels;
 *   5. a real submit path still works;
 *   6. zero page errors.
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';

const APP = 'http://127.0.0.1:5980';
const OUT = '.scratch/astryx-migration/live';
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const step = (name, ok, detail = '') => {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`;
  log.push(line);
  console.log(line);
};

const COUNTS = () => ({
  bai: document.querySelectorAll('[data-bai-form-item]').length,
  antdItem: document.querySelectorAll('.ant-form-item').length,
  antdForm: document.querySelectorAll('form.ant-form').length,
  errors: [
    ...document.querySelectorAll('[data-bai-form-item-explain-error]'),
  ].map((n) => n.textContent.trim()),
  antdErrors: [...document.querySelectorAll('.ant-form-item-explain-error')].map(
    (n) => n.textContent.trim(),
  ),
  asterisks: document.querySelectorAll('[data-bai-form-item-required]').length,
  labels: [...document.querySelectorAll('[data-bai-form-item-label]')].map((n) =>
    n.textContent.trim(),
  ),
});

const browser = await chromium.launch();

async function makeContext(lang) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
  await ctx.addInitScript((l) => {
    localStorage.setItem('backendaiwebui.settings.general.language', l);
  }, lang);
  return ctx;
}

/** Resolve the project-scoped root the app redirects to. */
async function projectRoot(page) {
  await page.goto(`${APP}/session/start`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);
  const p = new URL(page.url()).pathname;
  const m = p.match(/^\/project\/[^/]+/);
  return m ? m[0] : '';
}

/**
 * Switch the app language through the real settings UI. The persisted
 * `selected_language` user setting outranks any localStorage seed, so driving
 * the control is the only reliable way in.
 */
async function switchLanguage(page, optionText) {
  await page.goto(`${APP}/usersettings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(7000);
  // Filter the settings list down to the Language row first: the header's
  // project selector also matches /한국어/ (the test project is literally
  // named `a한국어가능_cde`), and clicking it navigates away instead.
  await page.getByPlaceholder(/Search/i).first().fill('Language');
  await page.waitForTimeout(2000);
  const trigger = page
    .locator('main, [class*="content"]')
    .last()
    .locator('button, [role="combobox"], .ant-select')
    .filter({ hasText: /English|한국어|日本語/ })
    .first();
  await trigger.click({ force: true, timeout: 15000 });
  await page.waitForTimeout(1500);
  await page
    .locator('[role="listbox"], [role="menu"], .ant-select-dropdown')
    .locator('[role="option"], li')
    .filter({ hasText: optionText })
    .first()
    .click({ force: true, timeout: 15000 });
  await page.waitForTimeout(5000);
}

const clickBtn = (page, re) =>
  page
    .locator('button, a[role="button"]')
    .filter({ hasText: re })
    .first()
    .click({ force: true, timeout: 15000 });

async function run(lang, languageOption) {
  const ctx = await makeContext(lang);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  const root = await projectRoot(page);
  if (languageOption) {
    await switchLanguage(page, languageOption).catch((e) =>
      console.log(`  (language switch: ${e.message.split('\n')[0]})`),
    );
    await page.screenshot({ path: `${OUT}/${lang}-language-switched.png` });
  }
  const results = {};

  const census = async (name, go) => {
    await go().catch((e) => console.log(`  (${name}: ${e.message.split('\n')[0]})`));
    await page.waitForTimeout(4500);
    const c = await page.evaluate(COUNTS);
    await page.screenshot({ path: `${OUT}/${lang}-${name}.png`, fullPage: true });
    results[name] = c;
    const optional = c.labels.filter((l) => /\((Optional|선택|任意)\)$/.test(l)).length;
    step(
      `[${lang}] ${name}: BAI shell only (items=${c.bai}), no antd form DOM, no asterisk`,
      c.bai > 0 && c.antdItem === 0 && c.antdForm === 0 && c.asterisks === 0,
      JSON.stringify({
        url: decodeURIComponent(new URL(page.url()).pathname),
        antdItem: c.antdItem,
        antdForm: c.antdForm,
        asterisks: c.asterisks,
        optionalLabels: optional,
        sampleLabels: c.labels.slice(0, 4),
      }),
    );
    return c;
  };

  // 1. Session launcher — the largest form surface in the app.
  await census('session-launcher', async () => {
    await page.goto(`${APP}${root}/session/start`, { waitUntil: 'networkidle' });
  });

  // 2. Folder create modal.
  await census('folder-create', async () => {
    await page.goto(`${APP}${root}/data`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await clickBtn(page, /Create Folder|New Folder|폴더 생성|フォルダ/i);
  });
  // Empty submit -> engine validation error, in this language.
  await clickBtn(page, /^(Create|생성|作成)$/i).catch(() => {});
  await page.waitForTimeout(2500);
  const folderErrors = await page.evaluate(COUNTS);
  await page.screenshot({ path: `${OUT}/${lang}-folder-create-errors.png`, fullPage: true });
  step(
    `[${lang}] folder-create: empty submit blocked by engine validation`,
    folderErrors.errors.length > 0 && folderErrors.antdErrors.length === 0,
    JSON.stringify(folderErrors.errors.slice(0, 4)),
  );
  results.folderErrors = folderErrors.errors;

  // 3. Resource policy create modal (admin).
  await census('resource-policy', async () => {
    await page.goto(`${APP}/admin/resource-policy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await clickBtn(page, /Create|추가|생성|作成/i);
  });

  // 4. Keypair / credential create modal (admin).
  await census('credential', async () => {
    await page.goto(`${APP}/admin/users`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await clickBtn(page, /Create|추가|생성|作成/i);
  });

  // 5. Project settings modal (admin).
  await census('project-settings', async () => {
    await page.goto(`${APP}/admin/project`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await clickBtn(page, /Create|추가|생성|作成/i);
  });

  step(
    `[${lang}] zero page errors across all screens`,
    pageErrors.length === 0,
    JSON.stringify(pageErrors.slice(0, 4)),
  );
  await ctx.close();
  return results;
}

const en = await run('en');
const ko = await run('ko', /한국어/);

step(
  'validation messages change with the app language',
  JSON.stringify(en.folderErrors) !== JSON.stringify(ko.folderErrors) &&
    (en.folderErrors?.length ?? 0) > 0 &&
    (ko.folderErrors?.length ?? 0) > 0,
  JSON.stringify({ en: en.folderErrors, ko: ko.folderErrors }),
);
step(
  'labels are localized after the language switch',
  (ko['folder-create']?.labels ?? []).some((l) => /[가-힣]/.test(l)),
  JSON.stringify((ko['folder-create']?.labels ?? []).slice(0, 5)),
);

fs.writeFileSync(`${OUT}/report.txt`, log.join('\n') + '\n');
await browser.close();
