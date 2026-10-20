import { type App, type Credential, type Screen, expect } from "e2e";

const loggedIn = (screen: Screen) => screen.getByTestId("user-dropdown-button");
const concurrentLoginDialog = (screen: Screen) =>
  screen.getByRole("alertdialog", "Logged in elsewhere");

/**
 * Signs in through the login form. A "Logged in elsewhere" dialog is accepted,
 * which ends the account's other session; `E2E_AGENT_NO_FORCE_LOGIN=1` fails instead.
 */
export async function signIn(
  app: App,
  screen: Screen,
  account: Credential,
  endpoint: string,
) {
  await app.open("/");
  await screen.getByLabel("Email or Username").fill(account.username);
  await screen.getByLabel("Password").fill(account.password);
  const endpointInput = screen.getByRole("textbox", "Endpoint");
  const advanced = screen.getByRole("link", "Advanced");
  if (!(await endpointInput.isVisible()) && (await advanced.isVisible())) {
    await advanced.tap();
  }
  // A config.toml that pins apiEndpoint renders no Endpoint field at all.
  const hasEndpointInput = await expect(endpointInput)
    .toBeVisible({ timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
  if (hasEndpointInput) await endpointInput.fill(endpoint);
  await screen.getByRole("button", "Login").tap();

  let forced = false;
  const deadline = Date.now() + 30_000;
  while (!(await loggedIn(screen).isVisible())) {
    const dialog = concurrentLoginDialog(screen);
    if (await dialog.isVisible()) {
      if (forced || process.env.E2E_AGENT_NO_FORCE_LOGIN === "1") {
        throw new Error(
          forced
            ? `e2e-agent: "${account.username}" is still reported as logged in elsewhere after a forced login`
            : `e2e-agent: "${account.username}" is logged in elsewhere; unset E2E_AGENT_NO_FORCE_LOGIN to end that session and log in`,
        );
      }
      console.log(
        `e2e-agent: "${account.username}" was logged in elsewhere; ending that session and logging in`,
      );
      await dialog.getByRole("button", "Login").tap();
      await dialog.waitFor({ state: "hidden", timeout: 10_000 });
      forced = true;
    }
    if (Date.now() > deadline) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  await expect(loggedIn(screen)).toBeVisible({ timeout: 1_000 });
}
