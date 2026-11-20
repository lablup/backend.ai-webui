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
    // Read-only: registering writes server-global app config (.claude/rules/e2e-admin-prep-via-api.md rule 5).
    await agent.act('Find the "App Config" section and read its result');
  },
);
