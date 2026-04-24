/**
 * E2E regression for FR-2616 Story 2 — `STokenLoginBoundary` applied to
 * the LoginView route tree (`/` and `/interactive-login`).
 *
 * Valid-token happy-path coverage requires a Backend.AI install with a
 * customer-specific auth plugin (auth-keypair / OpenID) to mint real
 * sTokens; standard installs do not provide one. These tests therefore
 * focus on:
 *   - invalid-token error UI renders and exposes a Retry button;
 *   - the non-sToken entry points still render the regular login form
 *     (regression guard — the boundary must not leak into non-sToken
 *     flows);
 *   - URL preservation on error: the boundary only strips `sToken`
 *     after a successful login, so an invalid token remains in the URL
 *     and the user's Retry can still pick it up.
 */
import { webuiEndpoint } from '../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'sToken login boundary (LoginView routes)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('visiting `/` without a sToken still renders the login form', async ({
      page,
    }) => {
      await page.goto(webuiEndpoint);
      // Regression guard: the route-level STokenGuard passes through when
      // no sToken is present, so the ordinary LoginView panel still mounts.
      await expect(page.getByLabel('Email or Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('invalid sToken on `/` surfaces the boundary error card with a Retry button', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/?sToken=invalid-token-for-e2e`);

      // The boundary renders one of the `STokenLoginError.kind`-specific
      // cards. Depending on reachability the kind will be either
      // `token-invalid` (server rejected the token) or `server-unreachable`
      // (no cluster), and in edge cases `endpoint-unresolved`. Match the
      // Retry button that is present in every kind's default card.
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByRole('button', { name: /copy error details/i }),
      ).toBeVisible();
    });

    test('invalid sToken on `/` does not strip the token from the URL', async ({
      page,
    }) => {
      await page.goto(`${webuiEndpoint}/?sToken=invalid-token-for-e2e`);
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
      // The boundary only calls `clearSToken(null)` from `onSuccess`.
      // On failure the token stays in the URL so the user can read it,
      // report it, or Retry which re-consumes the same value.
      expect(page.url()).toContain('sToken=invalid-token-for-e2e');
    });

    test('invalid sToken on `/interactive-login` surfaces the same error card', async ({
      page,
    }) => {
      await page.goto(
        `${webuiEndpoint}/interactive-login?sToken=invalid-token-for-e2e`,
      );
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible({
        timeout: 15_000,
      });
    });
  },
);
