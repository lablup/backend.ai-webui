import { test } from "@e2e-dev/web";

test(
  "the user switches to their personal project from the header project selector",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10490, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Open the "Project" selector in the header');
    await agent.act(
      'Choose your own project listed under the "Personal" group',
    );
    await agent.act("Reload the page");
  },
);
