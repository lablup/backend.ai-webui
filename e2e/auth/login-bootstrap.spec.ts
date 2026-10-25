/**
 * Login bootstrap (FR-2367)
 *
 * Page load used to probe the session with `POST /server/login-check` and
 * then fetch keypair, user and groups as three GraphQL queries. It now sends
 * one `loginBootstrapQuery` and reads "signed in" or "not signed in" off its
 * answer. These specs pin that contract against the real cluster:
 *   - no `/server/login-check` request on any path,
 *   - exactly one bootstrap query per page load,
 *   - the app still comes up as the user, and a session the server no
 *     longer holds lands back on the login form.
 */
import {
  loginAsUser,
  logout,
  userInfo,
  webServerEndpoint,
  webuiEndpoint,
} from '../utils/test-util';
import { expect, test, type Page } from '@playwright/test';

const LOGIN_CHECK = `${webServerEndpoint}/server/login-check`;
const GQL = `${webServerEndpoint}/func/admin/gql`;

type ApiTrace = {
  loginChecks: number;
  bootstraps: number;
  loginPosts: number;
};

/** Count the login flow's API calls from the moment `trace()` is attached. */
function trace(page: Page): ApiTrace {
  const t: ApiTrace = { loginChecks: 0, bootstraps: 0, loginPosts: 0 };
  page.on('request', (request) => {
    const url = request.url();
    if (url === LOGIN_CHECK) t.loginChecks += 1;
    if (url === `${webServerEndpoint}/server/login`) t.loginPosts += 1;
    if (
      url === GQL &&
      /query loginBootstrapQuery\b/.test(request.postData() ?? '')
    ) {
      t.bootstraps += 1;
    }
  });
  return t;
}

/**
 * Answer `loginBootstrapQuery` the way a manager resolver failure does:
 * `200` with `errors[]` and a null identity. Returns a switch that lets the
 * real bootstrap through again.
 */
async function failBootstrapWithNullIdentity(page: Page) {
  let failing = true;
  await page.route(GQL, async (route) => {
    const isBootstrap = /query loginBootstrapQuery\b/.test(
      route.request().postData() ?? '',
    );
    if (!failing || !isBootstrap) {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { keypair: null, user: null, groups: [] },
        errors: [{ message: 'e2e: mocked bootstrap resolver failure' }],
      }),
    });
  });
  return () => {
    failing = false;
  };
}

function countLogouts(page: Page) {
  const counter = { logouts: 0 };
  page.on('request', (request) => {
    if (request.url() === `${webServerEndpoint}/server/logout`) {
      counter.logouts += 1;
    }
  });
  return counter;
}

const loginForm = (page: Page) => page.getByLabel('Email or Username');
const accountInfoDialog = (page: Page) =>
  page.getByRole('dialog', { name: "Couldn't load your account information" });
const userMenu = (page: Page) => page.getByTestId('user-dropdown-button');

test.describe(
  'Login bootstrap (FR-2367)',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('guest reaches the login form through one refused bootstrap query and no login-check', async ({
      page,
    }) => {
      const api = trace(page);
      await page.goto(webuiEndpoint);
      await expect(loginForm(page)).toBeVisible({ timeout: 30_000 });
      // The silent re-login the app attempts on load is the last API call of a
      // guest page load; once it has gone out, the probe before it is settled.
      await expect.poll(() => api.loginPosts, { timeout: 15_000 }).toBe(1);
      expect(api.bootstraps).toBe(1);
      expect(api.loginChecks).toBe(0);
    });

    test('user can sign in with one bootstrap query after /server/login and no login-check', async ({
      page,
      request,
    }) => {
      const api = trace(page);
      await loginAsUser(page, request);
      await expect(userMenu(page)).toBeVisible();
      // The guest load probes once, pressing Login probes once more before
      // the credentials go out, and the accepted login bootstraps once.
      await expect.poll(() => api.bootstraps, { timeout: 15_000 }).toBe(3);
      expect(api.loginChecks).toBe(0);
    });

    test('signed-in user stays signed in across a reload with a single bootstrap query', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await expect(userMenu(page)).toBeVisible();

      const api = trace(page);
      await page.reload();
      await expect(userMenu(page)).toBeVisible({ timeout: 30_000 });
      await expect.poll(() => api.bootstraps, { timeout: 15_000 }).toBe(1);
      expect(api.loginChecks).toBe(0);
      expect(api.loginPosts).toBe(0);
    });

    test('user lands on the login form after signing out, without a login-check', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await expect(userMenu(page)).toBeVisible();
      await logout(page);
      await expect(loginForm(page)).toBeVisible({ timeout: 30_000 });

      const api = trace(page);
      await page.reload();
      await expect(loginForm(page)).toBeVisible({ timeout: 30_000 });
      await expect.poll(() => api.bootstraps, { timeout: 15_000 }).toBe(1);
      expect(api.loginChecks).toBe(0);
      await expect(userMenu(page)).toHaveCount(0);
    });
  },
);

test.describe(
  'Login bootstrap - Account info load failure',
  { tag: ['@regression', '@auth', '@functional'] },
  () => {
    test('Signed-in user can retry when the account info fails to load', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await expect(userMenu(page)).toBeVisible();

      const restoreBootstrap = await failBootstrapWithNullIdentity(page);
      const api = countLogouts(page);
      await page.reload();

      const dialog = accountInfoDialog(page);
      await expect(dialog).toBeVisible({ timeout: 30_000 });
      await expect(
        dialog.getByRole('button', { name: 'Log Out', exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Retry', exact: true }),
      ).toBeVisible();
      await expect(loginForm(page)).toBeHidden();
      expect(api.logouts).toBe(0);

      restoreBootstrap();
      await dialog.getByRole('button', { name: 'Retry', exact: true }).click();
      await expect(dialog).toBeHidden({ timeout: 30_000 });
      await expect(userMenu(page)).toBeVisible({ timeout: 30_000 });
      expect(api.logouts).toBe(0);
    });

    test('User can log out from the account info load failure dialog and sign in again', async ({
      page,
      request,
    }) => {
      await loginAsUser(page, request);
      await expect(userMenu(page)).toBeVisible();

      const restoreBootstrap = await failBootstrapWithNullIdentity(page);
      await page.reload();

      const dialog = accountInfoDialog(page);
      await expect(dialog).toBeVisible({ timeout: 30_000 });
      await dialog
        .getByRole('button', { name: 'Log Out', exact: true })
        .click();
      await expect(dialog).toBeHidden({ timeout: 30_000 });
      await expect(loginForm(page)).toBeVisible({ timeout: 30_000 });

      restoreBootstrap();
      await loginForm(page).fill(userInfo.user.email);
      await page.getByLabel('Password').fill(userInfo.user.password);
      const endpointInput = page.getByRole('textbox', {
        name: 'Endpoint',
        exact: true,
      });
      if (await endpointInput.isVisible().catch(() => false)) {
        await endpointInput.fill(webServerEndpoint);
      }
      const loginResponse = page.waitForResponse(
        (response) =>
          response.url() === `${webServerEndpoint}/server/login` &&
          response.request().method() === 'POST',
      );
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      expect((await loginResponse).status()).toBe(200);
      await expect(userMenu(page)).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText(/already logged in/i)).toHaveCount(0);
    });
  },
);
