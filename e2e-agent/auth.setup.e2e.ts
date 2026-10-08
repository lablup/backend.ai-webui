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
    if (!(await endpointInput.isVisible())) {
      await screen.getByRole("link", "Advanced").tap();
    }
    await endpointInput.fill(apiEndpoint);
    await screen.getByRole("button", "Login").tap();

    await expect(screen.getByTestId("user-dropdown-button")).toBeVisible({
      timeout: 30_000,
    });
    await session.save("admin");
  },
);
