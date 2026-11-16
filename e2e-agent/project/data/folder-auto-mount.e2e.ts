import { test } from "@e2e-dev/web";

const draft = {
  session: "user",
  tags: ["draft"],
  skip: "draft: act-only flow from #10529, awaiting completion by automation",
};

test(
  "the user creates a folder with auto-mount in their personal project",
  draft,
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act(
      'Open the "Select Project" selector in the header and choose your own project listed under the "Personal" group',
    );
    await agent.act('Press "Create Folder"');
    await agent.act('Enter a folder name in the "Folder name" field');
    await agent.act('Turn on the "Auto-mount settings" switch');
    await agent.act('Enter a path in the "Mount path" field');
    await agent.act('Press "Create"');
    await agent.act(
      'Find the new folder in the list and hover the info icon in its "Auto-mount" column',
    );
  },
);

test(
  "the user adds, edits and removes a folder's auto-mount from the folder explorer",
  draft,
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act(
      'Open the "Select Project" selector in the header and choose your own project listed under the "Personal" group',
    );
    await agent.act("Open a folder from its name link");
    await agent.act(
      'In the "Metadata" tab, press "Add auto-mount" in the "Auto-mount" section',
    );
    await agent.act('Enter a path in the "Mount path" field and press "Add"');
    await agent.act(
      'Press "Edit auto-mount", change the mount path and press "Save"',
    );
    await agent.act('Press "Remove auto-mount" and confirm with "Remove"');
  },
);
