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
  await agent.act('Choose "Switch to Admin Console"');
  await agent.act('Open "Maintenance" from the side menu');
  await agent.act('Press "Recalculate Usage"');
});

// ported from: e2e/maintenance/maintenance.spec.ts › click the Rescan Images button
test("click the Rescan Images button", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Switch to Admin Console"');
  await agent.act('Open "Maintenance" from the side menu');
  await agent.act('Press "Rescan Images"');
});
