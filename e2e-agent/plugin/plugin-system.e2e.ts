import { test } from "@e2e-dev/web";

const skip =
  "draft: act-only flow from #10551, awaiting completion by automation";
const adminDraft = { session: "admin", tags: ["draft"], skip };
const userDraft = { session: "user", tags: ["draft"], skip };

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see user-permission plugin menu item in sidebar
test(
  "Admin can see user-permission plugin menu item in sidebar",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With the "test-plugin" plugin page configured, look for "Open Backend.AI" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › User can see user-permission plugin menu item in sidebar
test(
  "User can see user-permission plugin menu item in sidebar",
  userDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With the "test-plugin" plugin page configured, look for "Open Backend.AI" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see admin-permission plugin in Admin Settings panel
test(
  "Admin can see admin-permission plugin in Admin Settings panel",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open the user menu in the header");
    await agent.act('Choose "Admin Settings"');
    await agent.act(
      'With the "admin-test-plugin" plugin page configured, look for "Admin Tool" in the admin side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin cannot see extra plugin menu when plugin.page is not set
test(
  "Admin cannot see extra plugin menu when plugin.page is not set",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With no plugin page configured, look for "Open Backend.AI" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin cannot see plugin menu when plugin JS file returns 404
test(
  "Admin cannot see plugin menu when plugin JS file returns 404",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With a plugin page whose script cannot be loaded, look for it and for "Dashboard" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can open external link plugin in new tab
test(
  "Admin can open external link plugin in new tab",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With the "test-plugin" plugin page configured, open "Open Backend.AI" from the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › User cannot see admin-permission plugin menu item
test(
  "User cannot see admin-permission plugin menu item",
  userDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With the "admin-test-plugin" plugin page configured, look for "Admin Tool" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin cannot see plugin that is in the blocklist
test(
  "Admin cannot see plugin that is in the blocklist",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With "test-plugin" configured and also in the menu blocklist, look for "Open Backend.AI" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see plugin that is not in the blocklist while blocked item is hidden
test(
  "Admin can see plugin that is not in the blocklist while blocked item is hidden",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With "test-plugin" configured and "chat" in the menu blocklist, look for "Open Backend.AI" and "Chat" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see multiple plugin menu items when multiple plugins are configured
test(
  "Admin can see multiple plugin menu items when multiple plugins are configured",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With "plugin-a" and "plugin-b" configured, look for "Plugin A" and "Plugin B" in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see valid plugin when one of multiple plugins fails to load
test(
  "Admin can see valid plugin when one of multiple plugins fails to load",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With "plugin-a" and a plugin whose script cannot be loaded configured, look for both in the side menu',
    );
  },
);

// ported from: e2e/plugin/plugin-system.spec.ts › Admin can see plugin menu item after page reload
test(
  "Admin can see plugin menu item after page reload",
  adminDraft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'With the "test-plugin" plugin page configured, look for "Open Backend.AI" in the side menu',
    );
    await agent.act("Reload the page");
    await agent.act('Look for "Open Backend.AI" in the side menu again');
  },
);
