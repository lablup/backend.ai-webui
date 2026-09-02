import { test, expect } from '@playwright/test';

/**
 * Smoke test for the Vite PoC dev server (FR-2606).
 * Runs against `pnpm --prefix ./react run vite:dev` on port 9081.
 *
 * Not part of CI. Kept on the PoC branch as a reproducer and regression
 * guard for the i18n-context-isolation fix (see react/vite-shims/).
 */
test('Vite PoC: app mounts at :9081 with host i18n translations rendered', async ({
  page,
}) => {
  test.skip(
    !!process.env.CI || !process.env.VITE_POC_SMOKE,
    'Local opt-in smoke test for a separately started Vite dev server (set VITE_POC_SMOKE=1 to run)',
  );

  // Pre-existing warnings unrelated to the Vite migration. Keep this list
  // short — new entries that look Vite-specific should fail the test.
  const KNOWN_PREEXISTING_WARNINGS = [
    // react-dom warns about some antd CSS-in-JS vendor prefixes under React 19.
    'Unsupported style property %s. Did you mean %s? -webkit-app-region',
    // antd v6 deprecation notice that is tracked independently.
    'antd: Dropdown',
  ];

  const pageErrors: string[] = [];
  const networkFailures: Array<{ url: string; status: number }> = [];
  const filteredErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (KNOWN_PREEXISTING_WARNINGS.some((k) => text.includes(k))) return;
    filteredErrors.push(text);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`${err.message}\n${err.stack ?? ''}`);
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      networkFailures.push({ url: resp.url(), status: resp.status() });
    }
  });

  await page.goto('http://127.0.0.1:9081/', { waitUntil: 'domcontentloaded' });

  // Wait for React to mount the login form.
  await page
    .getByRole('button', { name: /session|api|login/i })
    .first()
    .waitFor({ timeout: 15_000 });

  const bodyText = await page.evaluate(() => document.body.innerText ?? '');

  // The regression the shim fix targets: host app keys (`login.X`) were
  // rendering as raw strings instead of resolved translations because
  // BUI's <I18nextProvider> was leaking into the host tree under Vite's
  // deduped module graph. Asserting that the rendered text does NOT
  // contain raw keys is the core regression guard.
  expect(
    bodyText,
    'host i18n translations must be resolved, not rendered as keys',
  ).not.toMatch(/\blogin\.[A-Za-z]+/);

  // A few positive-example translations that should appear on the login
  // page in English. (If the page adds/removes these someday, adjust the
  // list — the negative match above is the primary check.)
  expect(bodyText).toMatch(/Forgot password\?/);
  expect(bodyText).toMatch(/Sign up/);

  expect(pageErrors, 'no uncaught page errors').toEqual([]);
  expect(networkFailures, 'no failed network requests').toEqual([]);
  expect(
    filteredErrors,
    'no console errors beyond the known-pre-existing set',
  ).toEqual([]);
});
