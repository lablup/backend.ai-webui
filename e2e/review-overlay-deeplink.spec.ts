import { webuiEndpoint } from './utils/test-util';
import { expect, test } from '@playwright/test';

/**
 * FR-3813 — the review overlay's deep link, against a dev server started with
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

  test('@smoke a self-contained link pins the element and names it', async ({
    page,
  }) => {
    await page.goto(webuiEndpoint, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () =>
        (window as unknown as { __baiReviewOverlay?: boolean })
          .__baiReviewOverlay,
    );

    const link = await page.evaluate(
      async ([anchorUrl, codecUrl, idUrl]) => {
        // Variable specifiers: these modules are served by the dev plugin at
        // request time and have no counterpart in the repo's module graph.
        const [anchorMod, codecMod, idMod] = await Promise.all([
          import(/* @vite-ignore */ anchorUrl),
          import(/* @vite-ignore */ codecUrl),
          import(/* @vite-ignore */ idUrl),
        ]);
        const usable = (element: Element): boolean => {
          // react-grab's own hit layer is a full-viewport pointer-events:none
          // div that matches every "big visible element" filter.
          if (element.closest('[data-bai-review-overlay]')) return false;
          if (element.closest('[data-testid="react-grab-overlay"]'))
            return false;
          const box = element.getBoundingClientRect();
          if (box.width < 8 || box.height < 8) return false;
          const style = getComputedStyle(element);
          if (
            style.visibility === 'hidden' ||
            style.display === 'none' ||
            style.pointerEvents === 'none'
          )
            return false;
          return !!(element as HTMLElement).innerText?.trim();
        };
        const find = (selector: string) =>
          [...document.querySelectorAll(selector)].find(usable);
        // A real interactive element first: it has text for the anchor's
        // fallback scan and it survives the SPA re-rendering around it.
        const pick = () =>
          find('button, a[href]') ?? find('[data-testid]') ?? null;

        // The anchor carries the route it was captured on and the deep link
        // reproduces it, so it has to be the SETTLED one: a dev server with
        // credentials injected leaves `/` for `/project/<name>/start` about
        // 5 s in, and a `/`-anchored pin never resolves after that.
        // Polled in-page on purpose: a Playwright locator pierces the
        // overlay's shadow root and would settle on its own dock button.
        const deadline = Date.now() + 25_000;
        let url = location.href;
        let since = Date.now();
        let target: Element | null = null;
        for (;;) {
          if (location.href !== url) {
            url = location.href;
            since = Date.now();
          }
          target = pick();
          if (target && Date.now() - since >= 1500) break;
          if (Date.now() > deadline) {
            throw new Error(`no settled element to anchor to on ${url}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
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
      { waitUntil: 'domcontentloaded' },
    );

    await expect(
      page.locator(`[data-bai-review-overlay] .pin[data-pin-id="${link.id}"]`),
    ).toBeVisible({ timeout: 30_000 });
    const card = page.locator(
      `[data-bai-review-overlay] .card[data-pin-id="${link.id}"]`,
    );
    await expect(card).toBeVisible();
    await expect(card).toContainText(link.id);
  });
});
