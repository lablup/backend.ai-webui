import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

// ported from: e2e/maintenance/maintenance.spec.ts › click the Recalculate Usage button
test("click the Recalculate Usage button", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Admin Settings"');
  await agent.act('Open "Maintenance" from the side menu');
  await agent.act('Press "Recalculate Usage"');
});

// ported from: e2e/maintenance/maintenance.spec.ts › click the Rescan Images button
test("click the Rescan Images button", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Admin Settings"');
  await agent.act('Open "Maintenance" from the side menu');
  await agent.act('Press "Rescan Images"');
});

// ported from: e2e/maintenance/maintenance.spec.ts › Admin can publish a system announcement with a title
test(
  "Admin can publish a system announcement with a title",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
    await agent.act('Open "Maintenance" from the side menu');
    await agent.act('Press "Edit Announcement"');
    await agent.act('Press "Publish" without a title');
    await agent.act("Enter a title and a body for the announcement");
    await agent.act('Press "Publish"');
    await agent.act('Press "See Details" on the announcement banner');
  },
);

// ported from: e2e/maintenance/maintenance.spec.ts › Admin can save an announcement as a draft without showing the banner
test(
  "Admin can save an announcement as a draft without showing the banner",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
    await agent.act('Open "Maintenance" from the side menu');
    await agent.act('Press "Edit Announcement"');
    await agent.act("Enter a title and a body for the announcement");
    await agent.act('Choose "Save as Draft"');
    await agent.act('Press "Edit Announcement" again and then "Cancel"');
  },
);
