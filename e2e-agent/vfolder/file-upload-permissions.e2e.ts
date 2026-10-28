import { test } from "@e2e-dev/web";

// #10647: the create modal offers no mount permission (every folder starts
// read-only for shared users) and the explorer shows none; the folder's default
// mount permission is read and edited in the share modal's folder settings card.
const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10647, awaiting completion by automation",
};

// ported from: e2e/vfolder/file-upload-permissions.spec.ts › User creates a folder and it is read-only for shared users
test(
  "the user creates a folder and it is read-only for shared users",
  draft,
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Press "Create Folder"');
    await agent.act(
      'Enter a folder name, keep the "General" usage mode and press "Create"',
    );
    await agent.act(
      'Find the new folder in the list and read its "Read only" mount permission',
    );
    await agent.act("Open the new folder from its name link");
    await agent.act(
      'Read the folder details, which list "Ownership" and no mount permission row, then press "Close"',
    );
  },
);

// ported from: e2e/vfolder/file-upload-permissions.spec.ts › User can change the default mount permission from the share modal
test(
  "the user changes a folder's default mount permission from the share modal",
  draft,
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Open the "Share Folder" action of a folder the user owns');
    await agent.act(
      'Read the "Folder Info" section, which shows the folder name and "Read only" as the default mount permission, and press "Edit"',
    );
    await agent.act(
      'In the "Edit default mount permission" dialog choose "Read & Write" and press "Save"',
    );
    await agent.act(
      'Read "Read & Write" as the default mount permission on the "Folder Info" section',
    );
    await agent.act('Close the "Share Folder" dialog');
  },
);
