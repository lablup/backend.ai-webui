import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10684, awaiting completion by automation",
};

test(
  "the superadmin opens Configurations from the System Settings page",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Open the "Configurations" tab');
    await agent.act(
      'Open the "Scheduler" settings and read the current scheduler type',
    );
  },
);

test(
  "the old Configurations address lands on its tab in System Settings",
  draft,
  async ({ app, agent }) => {
    await app.open("/settings");
    await agent.act(
      'Look for the "Configurations" tab being selected on the System Settings page',
    );
  },
);
