import { webuiEndpoint } from './utils/test-util';
import { expect, test } from '@playwright/test';

/**
 * FR-3813 — review overlay read side, against a dev server started with
 * `VITE_DEV_REVIEW_OVERLAY=1`. CI has no such server, so the whole file is
 * opt-in: `E2E_REVIEW_OVERLAY_SMOKE=1 pnpm exec playwright test
 * e2e/review-overlay-deeplink.spec.ts --project chromium`.
 *
 * No backend session is needed: whatever the dev server renders — the login
 * form, or the app shell when a session is already live — the test picks a
 * real visible element off that page and builds its anchor with the overlay's
 * OWN codec, so it exercises the real `#bai=v3` round trip rather than a
 * hand-written fixture that can drift from the encoder.
 */
test.describe('@review-overlay review overlay deep link', () => {
  test.beforeEach(() => {
    test.skip(
      !!process.env.CI || !process.env.E2E_REVIEW_OVERLAY_SMOKE,
      'Needs a dev server with VITE_DEV_REVIEW_OVERLAY=1 (set E2E_REVIEW_OVERLAY_SMOKE=1)',
    );
  });

  test('@smoke a self-contained link pins the element and opens its panel item', async ({
    page,
  }) => {
    await page.goto(webuiEndpoint, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () =>
        (window as unknown as { __baiReviewOverlay?: boolean })
          .__baiReviewOverlay,
    );
    // Let the SPA settle on its final route before the anchor is captured —
    // the deep link reproduces that route, so it must be the resolved one.
    await page
      .locator('button:visible, a[href]:visible')
      .first()
      .waitFor({ timeout: 30_000 });
    await page.waitForTimeout(2000);

    const link = await page.evaluate(
      async ([anchorUrl, codecUrl, idUrl]) => {
        // Variable specifiers: these modules are served by the dev plugin at
        // request time and have no counterpart in the repo's module graph.
        const [anchorMod, codecMod, idMod] = await Promise.all([
          import(/* @vite-ignore */ anchorUrl),
          import(/* @vite-ignore */ codecUrl),
          import(/* @vite-ignore */ idUrl),
        ]);
        const overlay = document.querySelector('[data-bai-review-overlay]');
        const target = [
          ...document.querySelectorAll('[data-testid], button, a[href]'),
        ].find((element) => {
          if (overlay?.contains(element)) return false;
          const box = element.getBoundingClientRect();
          return box.width > 8 && box.height > 8;
        });
        if (!target) throw new Error('no element to anchor to on this page');
        const anchor = anchorMod.captureAnchorSignals(target);
        const b64: string = await codecMod.encodeAnchor(anchor);
        return {
          id: idMod.pinId(0, b64, '2026-09-01T00:00:00Z') as string,
          b64,
          path: `${anchor.p}${anchor.q ? `?${anchor.q}` : ''}`,
        };
      },
      ['/__review/anchor.js', '/__review/codec.js', '/__review/id.js'] as const,
    );

    // A FRESH load, the way a reviewer opens the link from a PR comment.
    await page.goto(
      `${webuiEndpoint}${link.path}#bai=v3.${link.id}.${link.b64}`,
      {
        waitUntil: 'domcontentloaded',
      },
    );

    const pin = page.locator('[data-bai-review-overlay] .pin').first();
    await expect(pin).toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator(`[data-bai-review-overlay] .item[data-pin-id="${link.id}"]`),
    ).toBeVisible();
    await expect(
      page.locator('[data-bai-review-overlay] .panel'),
    ).toBeVisible();
  });

  test('the endpoints take no parameters, answer GET only and share one read', async ({
    page,
  }) => {
    const first = await page.request.get(`${webuiEndpoint}/__review/pins`);
    expect(first.ok()).toBe(true);
    const withJunk = await page.request.get(
      `${webuiEndpoint}/__review/pins?anything=1`,
    );
    // Same 15 s cache entry — identical bodies, `fetchedAt` included.
    expect(await withJunk.json()).toEqual(await first.json());

    const posted = await page.request.post(`${webuiEndpoint}/__review/pins`);
    expect(posted.status()).toBe(405);

    const state = await (
      await page.request.get(`${webuiEndpoint}/__review/state`)
    ).json();
    expect(state).toHaveProperty('served');
    expect(state).toHaveProperty('isPrivate');
  });
});
