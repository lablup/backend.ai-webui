import { type App, type Credential, type Screen, expect } from "e2e";

const loggedIn = (screen: Screen) => screen.getByTestId("user-dropdown-button");
const concurrentLoginDialog = (screen: Screen) =>
  screen.getByRole("alertdialog", "Logged in elsewhere");

/**
 * A config.toml without apiEndpoint asks for the server first (#10872), and a
 * confirmed server shows beside "Change endpoint". Returns whether the page
 * uses that step; false leaves the endpoint to the form's own field.
 */
async function confirmEndpointStep(screen: Screen, endpoint: string) {
  const stepInput = screen.getByTestId("login-endpoint-step-input");
  const changeEndpoint = screen.getByTestId("login-change-endpoint");
  const email = screen.getByLabel("Email or Username");
  const deadline = Date.now() + 30_000;
  // A stored server is confirmed on its own first; the step is read-only until
  // that check ends with the form (or an editable step on failure).
  const isStepEditable = async () =>
    (await stepInput.isVisible()) && (await stepInput.isEnabled());
  while (
    !(await isStepEditable()) &&
    !(await email.isVisible()) &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  const confirm = async () => {
    await stepInput.fill(endpoint);
    await screen.getByTestId("login-endpoint-step-continue").tap();
    await expect(email).toBeVisible({ timeout: 30_000 });
  };
  if (await isStepEditable()) {
    await confirm();
    return true;
  }
  if (!(await changeEndpoint.isVisible())) return false;
  const shown = await screen.getByTestId("login-endpoint-row").textContent();
  if (!(shown ?? "").includes(endpoint.replace(/\/+$/, ""))) {
    await changeEndpoint.tap();
    await confirm();
  }
  return true;
}

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
  const endpointConfirmed = await confirmEndpointStep(screen, endpoint);
  await screen.getByLabel("Email or Username").fill(account.username);
  await screen.getByLabel("Password").fill(account.password);
  if (!endpointConfirmed) {
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
  }
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
