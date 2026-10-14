import { test } from "@e2e-dev/web";

// ported from: e2e/vfolder/vfolder-crud.spec.ts › User can create, delete(move to trash), restore, delete forever vFolder
test(
  "User can create, delete(move to trash), restore, delete forever vFolder",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow (SCRATCH TEST for the nightly e2e-draft job — do not merge), awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Press "Create Folder", enter a folder name and press "Create"');
    await agent.act('In the "Active" tab, move the new folder to the trash bin');
    await agent.act('Open the "Trash" tab and restore the folder');
    await agent.act('In the "Active" tab, move the folder to the trash bin again');
    await agent.act('Open the "Trash" tab and delete the folder forever');
  },
);
