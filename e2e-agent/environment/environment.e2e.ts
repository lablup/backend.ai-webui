import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

// ported from: e2e/environment/environment.spec.ts › Rendering Image List
test("Rendering Image List", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Switch to Admin View"');
  await agent.act('Open "Environments" from the side menu');
  await agent.act("Select an image that is not installed");
  await agent.act('Press "Install Image" and confirm with "Install"');
});

// ported from: e2e/environment/environment.spec.ts › user can modify image resource limit
test("user can modify image resource limit", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Switch to Admin View"');
  await agent.act('Open "Environments" from the side menu');
  await agent.act(
    'Press "Edit Minimum Image Resource Limit" on the first image row',
  );
  await agent.act('Change the CPU value and press "Save"');
  await agent.act(
    'Open the same dialog again, restore the original CPU value and press "Save"',
  );
});

// ported from: e2e/environment/environment.spec.ts › user can manage apps
test("user can manage apps", draft, async ({ app, agent }) => {
  await app.open("/start");
  await agent.act("Open the user menu in the header");
  await agent.act('Choose "Switch to Admin View"');
  await agent.act('Open "Environments" from the side menu');
  await agent.act('Press "Manage Apps" on the first image row');
  await agent.act('Press "Add" and fill in an app name, protocol and port');
  await agent.act('Press "OK" and confirm the reinstallation notice');
  await agent.act('Open "Manage Apps" again, delete the added app and press "OK"');
});

// ported from: e2e/environment/environment.spec.ts › Admin can see the BAIPropertyFilter on the Images tab
test(
  "Admin can see the BAIPropertyFilter on the Images tab",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Look at the filter bar above the image list");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can filter images by name using a text value
test(
  "Admin can filter images by name using a text value",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Filter the images by name with a text value and apply it");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can filter images by architecture using strict selection
test(
  "Admin can filter images by architecture using strict selection",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Filter the images by architecture, choosing a listed value");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can filter images by status using strict selection
test(
  "Admin can filter images by status using strict selection",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Filter the images by status, choosing a listed value");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can filter images by type using strict selection
test(
  "Admin can filter images by type using strict selection",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Filter the images by type, choosing a listed value");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can filter images by registry using a text value
test(
  "Admin can filter images by registry using a text value",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act(
      "Filter the images by registry with a text value and apply it",
    );
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can apply multiple filters simultaneously and see the clear-all button
test(
  "Admin can apply multiple filters simultaneously and see the clear-all button",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Apply a name filter and an architecture filter together");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can clear a single filter token by clicking its remove button
test(
  "Admin can clear a single filter token by clicking its remove button",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Apply two filters");
    await agent.act("Remove one filter token with its remove button");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin can clear all filters at once using the clear-all button
test(
  "Admin can clear all filters at once using the clear-all button",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Apply two filters");
    await agent.act("Clear all filters with the clear-all button");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin sees pagination reset to page 1 when a filter is applied on page 2
test(
  "Admin sees pagination reset to page 1 when a filter is applied on page 2",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Go to page 2 of the image list");
    await agent.act("Apply a name filter");
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin cannot select an architecture value that is not a registered option
test(
  "Admin cannot select an architecture value that is not a registered option",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act(
      "Start an architecture filter and type a value that is not in the list",
    );
  },
);

// ported from: e2e/environment/environment.spec.ts › Admin sees empty state when filtering by a non-existent image name
test(
  "Admin sees empty state when filtering by a non-existent image name",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Filter the images by a name that no image has");
  },
);

// ported from: e2e/environment/environment.spec.ts › Superadmin can import an image from a canonical reference
test(
  "Superadmin can import an image from a canonical reference",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Import Image" dialog');
    await agent.act(
      "Enter a canonical image reference from a registered registry and choose its architecture",
    );
    await agent.act('Press "Import Image"');
  },
);

// ported from: e2e/environment/environment.spec.ts › Superadmin cannot import invalid lines or images from an unregistered registry
test(
  "Superadmin cannot import invalid lines or images from an unregistered registry",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Import Image" dialog');
    await agent.act(
      "Enter an invalid line and an image from an unregistered registry",
    );
    await agent.act('Press "Cancel"');
  },
);

// ported from: e2e/environment/environment.spec.ts › Superadmin can rescan a single ALIVE image from the Images list
test(
  "Superadmin can rescan a single ALIVE image from the Images list",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Press "Rescan" on an alive image row');
  },
);

// ported from: e2e/environment/environment.spec.ts › Superadmin cannot see the Rescan button on a non-ALIVE image row
test(
  "Superadmin cannot see the Rescan button on a non-ALIVE image row",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act("Look at the row actions of a deleted image");
  },
);
