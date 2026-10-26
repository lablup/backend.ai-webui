import { test } from "@e2e-dev/web";

// ported from: e2e/agent/agent.spec.ts › should have at least one connected agent
test(
  "should have at least one connected agent",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10551, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin Console"');
    await agent.act('Open "Resources" from the side menu');
    await agent.act('Open the "Agent" tab');
    await agent.act('Choose the "Connected" filter');
  },
);
