import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

test(
  "the superadmin lands on the admin settings and follows the first-use tour back to the user view",
  draft,
  async ({ app, agent }) => {
    await app.open("/");
    await agent.act(
      'Read the "The superadmin view has changed" dialog and press "Next"',
    );
    await agent.act('Read the "Switching to the user view" tour and press "Done"');
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to User View"');
    await agent.act(
      'Read the "Returning to the admin settings" tour and press "Done"',
    );
  },
);

test(
  "the superadmin opens the admin settings from the header user menu",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
  },
);

test(
  "the superadmin returns to the user view from the header user menu",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to User View"');
  },
);

test(
  "a project admin opens the project settings from the side menu",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      "Select a project you administer in the header project selector",
    );
    await agent.act('Open "Project Settings" from the side menu');
    await agent.act('Press "Go Back" next to the "Project Settings" heading');
  },
);
