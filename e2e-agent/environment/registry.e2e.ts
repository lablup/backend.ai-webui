import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10551, awaiting completion by automation",
};

// ported from: e2e/environment/registry.spec.ts › Admin can see the registry table with all expected columns
test(
  "Admin can see the registry table with all expected columns",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the Add Registry button and filter bar
test(
  "Admin can see the Add Registry button and filter bar",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the Enabled toggle switch in each registry row
test(
  "Admin can see the Enabled toggle switch in each registry row",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the Control buttons (Edit, Delete, Rescan) in each registry row
test(
  "Admin can see the Control buttons (Edit, Delete, Rescan) in each registry row",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can add a new registry with required fields only
test(
  "Admin can add a new registry with required fields only",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act('Press "Add Registry"');
    await agent.act("Fill in only the required fields and save");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the new registry in the table
test(
  "Admin can see the new registry in the table",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Find the newly added registry in the table");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can edit the registry URL and project name
test(
  "Admin can edit the registry URL and project name",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Press Edit on the added registry");
    await agent.act("Change its URL and project name and save");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the modified registry values in the table
test(
  "Admin can see the modified registry values in the table",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Find the edited registry in the table");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see the Is Global checkbox is checked by default for new registries
test(
  "Admin can see the Is Global checkbox is checked by default for new registries",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act('Press "Add Registry" and look at "Is Global"');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can delete the registry with correct name confirmation
test(
  "Admin can delete the registry with correct name confirmation",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Press delete on the added registry");
    await agent.act('Type the registry name and press "Delete"');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can toggle registry enabled/disabled state
test(
  "Admin can toggle registry enabled/disabled state",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Toggle a registry's Enabled switch and toggle it back");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin cannot delete a registry without entering the correct name
test(
  "Admin cannot delete a registry without entering the correct name",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Press delete on a registry and type a wrong name");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can cancel the delete confirmation dialog without deleting
test(
  "Admin can cancel the delete confirmation dialog without deleting",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act('Press delete on a registry and then "Cancel"');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can open the Modify Registry dialog for an existing registry
test(
  "Admin can open the Modify Registry dialog for an existing registry",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Press Edit on an existing registry");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can enable the password field by checking Change Password
test(
  "Admin can enable the password field by checking Change Password",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Press Edit on an existing registry");
    await agent.act('Check "Change Password"');
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can filter registries by name using a partial text value
test(
  "Admin can filter registries by name using a partial text value",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Filter the registries by part of a registry name");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin sees empty state when filtering by a non-existent registry name
test(
  "Admin sees empty state when filtering by a non-existent registry name",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Filter the registries by a name no registry has");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can clear the filter tag and restore the full registry list
test(
  "Admin can clear the filter tag and restore the full registry list",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Filter the registries by name");
    await agent.act("Remove the filter tag");
  },
);

// ported from: e2e/environment/registry.spec.ts › Admin can see Registry Name offered as a filter field
test(
  "Admin can see Registry Name offered as a filter field",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Switch to Admin View"');
    await agent.act('Open "Environments" from the side menu');
    await agent.act('Open the "Registries" tab');
    await agent.act("Open the filter bar's field list");
  },
);
