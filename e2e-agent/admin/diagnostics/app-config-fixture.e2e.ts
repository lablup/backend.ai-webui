import { test } from "@e2e-dev/web";

test(
  "the superadmin checks the app config registration on Diagnostics",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10229, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/admin/diagnostics");
    await agent.act('Find the "App Config" section and read its result');
    await agent.act(
      'If entries are missing, press "Register Missing Entries"',
    );
    await agent.act('Read the "App Config" result again');
  },
);
