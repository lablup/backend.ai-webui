import { test } from "@e2e-dev/web";

// ported from: e2e/vfolder/vfolder-type-selection.spec.ts › User creates a user folder without any Type selection
test(
  "the user creates a folder in the current project from the Data page",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10501, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act(
      'Read the notice that folders created in the current project are visible to its members',
    );
    await agent.act('Press "Create Folder"');
    await agent.act('Enter a folder name in the "Folder name" field');
    await agent.act('Press "Create"');
    await agent.act(
      "Open the new folder and check that it belongs to the current project",
    );
  },
);

// ported from: e2e/vfolder/vfolder-type-selection.spec.ts › Auto Mount is not offered for project folders
test(
  "the user creates an Auto Mount folder in the current project",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10501, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Press "Create Folder"');
    await agent.act('Choose "Auto Mount" as the usage mode');
    await agent.act(
      'Enter a folder name that starts with a dot in the "Folder name" field',
    );
    await agent.act('Press "Create"');
  },
);
