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
