import { test } from "@e2e-dev/web";

// #10659: the share modal offers a project as the recipient; the project's
// members mount the folder at its default mount permission.
test(
  "the user shares a folder with a project",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #10659, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/data");
    await agent.act('Open the "Share Folder" action of a folder the user owns');
    await agent.act('Choose "Share with project" under "Invite User"');
    await agent.act('Select a project in the "Project" field');
    await agent.act(
      'Read the "Mount permission" field, which is disabled at the folder default, and press "Invite"',
    );
    await agent.act(
      'Find the project in the "Shared Users" list with a "Project" token and a "Pending" status',
    );
    await agent.act('Close the "Share Folder" dialog');
  },
);
