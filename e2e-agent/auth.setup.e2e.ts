import { test } from "@e2e-dev/web";
import { credentials, expect } from "e2e";

const apiEndpoint =
  process.env.E2E_WEBSERVER_ENDPOINT ?? "http://127.0.0.1:8090";

test.setup(
  "sign in as admin",
  { sessions: ["admin"] },
  async ({ app, screen, session }) => {
    const admin = credentials.user("admin");

    await app.open("/");
    await screen.getByLabel("Email or Username").fill(admin.username);
    await screen.getByLabel("Password").fill(admin.password);
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
    if (hasEndpointInput) await endpointInput.fill(apiEndpoint);
    await screen.getByRole("button", "Login").tap();

    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });
    await session.save("admin");
  },
);
