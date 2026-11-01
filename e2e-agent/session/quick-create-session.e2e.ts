import { test } from "@e2e-dev/web";

test(
  "the user starts a session from the quick-create modal on the sessions page",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #10740, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/session");
    await agent.act('Open the "More" menu next to "Start Session"');
    await agent.act('Choose "Quick create"');
    await agent.act('Type a session name in "Session Name"');
    await agent.act(
      'Drag across the "CPU" grid to select a rectangle of cores',
    );
    await agent.act(
      'Drag across the "Memory" grid to select a rectangle of memory',
    );
    await agent.act('Choose "Interactive" as the session type');
    await agent.act('Press "Start"');
    await agent.act('Confirm starting without a folder by pressing "Start"');
  },
);

test(
  "the user drags resources on the sessions page's resource grid and starts a session from the floating button",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #10740, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/usersettings");
    await agent.act(
      'Turn on "Resource grid launcher" in the experimental features',
    );
    await app.open("/session");
    await agent.act(
      'Drag across the free "CPU" cells in "My Resources in" to select cores',
    );
    await agent.act('Drag across the free "Memory" cells to select memory');
    await agent.act(
      'Press "Start a session with the selected resources" at the bottom of the page',
    );
    await agent.act('Press "Start" in the "Quick Create Session" dialog');
    await agent.act('Confirm starting without a folder by pressing "Start"');
  },
);
