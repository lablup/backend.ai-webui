import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test(
  "the agent opens the Sessions page from the side menu",
  { session: "admin" },
  async ({ app, agent, browser }) => {
    await app.open("/summary");

    await agent.act("Open the Sessions page from the side menu");

    await expect(browser).toHaveURL(/\/session/);
  },
);
