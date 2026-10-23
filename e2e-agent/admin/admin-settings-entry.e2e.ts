import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

test(
  "the superadmin opens the admin settings from the header user menu",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
  },
);

test(
  "the superadmin returns to the user view from the header user menu",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Back to User View"');
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
