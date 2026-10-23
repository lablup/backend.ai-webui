import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

// ported from: e2e/config/config.spec.ts › block list
test(
  "block list",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With "start", "deployments" and "session" in the menu blocklist, look for the Start, Sessions and Deployments entries in the side menu',
    );
    await agent.act("Open the Start, Serving and Job pages by their addresses");
    await agent.act(
      "Clear the menu blocklist, reload the page and look for the same side menu entries",
    );
  },
);

// ported from: e2e/config/config.spec.ts › showNonInstalledImages: Allow users to select non-installed images when creating sessions
test(
  "showNonInstalledImages: Allow users to select non-installed images when creating sessions",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act(
      'Sort the images by "Status" and find an image that is not installed',
    );
    await agent.act('Go to the Start page and press "Start Session" on "Start Interactive Session"');
    await agent.act('Go to the "Environments & Resource" step');
    await agent.act(
      'Open the "Environments / Version" selector and search for the not-installed image',
    );
    await agent.act(
      "Turn off showNonInstalledImages, reload, and open the same selector in a new interactive session launcher",
    );
  },
);
