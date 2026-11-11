import { test } from "@e2e-dev/web";

// ported from: e2e/admin/system-settings/webui-settings.spec.ts
const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #10941, awaiting completion by automation",
};

test(
  "superadmin sees every group and every row with its code default",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act("Read the notice at the top of the System Settings page");
    await agent.act(
      "Go through every settings group and read each row's value",
    );
  },
);

test(
  "domain admin cannot open System Settings",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Sign out and sign in with a domain admin account");
    await agent.act('Open the "System Settings" page by its address');
  },
);

test(
  "a checkbox row saves on change and its reset removes the saved key",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn off the "Hide agents" checkbox');
    await agent.act('Reset the "Hide agents" row to its default');
  },
);

test(
  "a number row saves on commit and its reset removes the saved key",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Type a new value into "Maximum CPU cores per session" and press Enter',
    );
    await agent.act('Reset the "Maximum CPU cores per session" row');
  },
);

test(
  "the Reset button deletes both saved documents after a typed confirmation",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Change the "Hide agents" and "Debug mode" rows');
    await agent.act('Press the toolbar "Reset" button');
    await agent.act('Type the confirmation word and press "Reset"');
  },
);

test(
  "changes save only the changed keys, survive a reload, and resetting them removes the document",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn off "Hide agents"');
    await agent.act('Change "Maximum CPU cores per session" and press Enter');
    await agent.act("Reload the page and read both rows");
    await agent.act("Reset both rows and reload the page");
  },
);

test(
  "superadmin saves a Sign-in row into the public document",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn on "API key sign-in"');
  },
);

test(
  "a change reaches the running app without a reload",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn off "Show desktop app downloads" and "Show CLI downloads"',
    );
    await agent.act('Open the user menu and look for "Downloads"');
  },
);

test(
  "a failed save rolls the row back and names the setting",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn on "Mask user information" while saving is refused');
    await agent.act("Read the dialog that lists the settings not saved");
  },
);

test(
  "a value in the domain document overrides the default for every domain key",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act("Change every row outside the Sign-in group");
    await agent.act(
      "Sign out, sign in again and read the System Settings rows",
    );
  },
);

test(
  "a wrong-typed value or an absent key keeps the default",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act("Read the rows whose saved value has the wrong type");
  },
);

test(
  "a key saved under the other scope is ignored",
  draft,
  async ({ app, agent }) => {
    await app.open("/interactive-login?callback=https://example.com&name=Test");
    await agent.act("Read the account shown and the account switch button");
  },
);

test(
  "a value in the public document overrides the default on the login page before sign-in",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn on "API key sign-in" and "Password reset", and pick both SSO vendors',
    );
    await agent.act("Sign out and read the login page");
  },
);

test(
  "a key absent from the public document keeps the login page default",
  draft,
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Sign out and read the login page options");
  },
);

test(
  "hideAgents controls the Agent Summary menu and the launcher agent selector",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn off "Hide agents"');
    await agent.act('Look for "Agent Summary" in the sidebar');
    await agent.act(
      "Open the session launcher and look for the agent selector",
    );
  },
);

test(
  "menuBlocklist from the domain document hides a page from the sidebar and its route, but never System Settings",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Add "Data" and "System Settings" to "Hide menus"');
    await agent.act('Look for "Data" and "System Settings" in the sidebar');
    await agent.act('Open the "Data" page by its address');
  },
);

test(
  "maxCPUCoresPerContainer from the domain document caps the session launcher",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Lower "Maximum CPU cores per session" and press Enter');
    await agent.act("Open the session launcher and read the CPU limit");
  },
);

test(
  "download panel keys from the domain document remove the Downloads menu item",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn off "Show desktop app downloads" and "Show CLI downloads"',
    );
    await agent.act('Open the user menu and look for "Downloads"');
  },
);

test(
  "enableModelFolders from the domain document removes Models from the Data page",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn off "Enable model folders"');
    await agent.act('Open the "Data" page and look for the Models tab');
  },
);

test(
  "plugin paths from the public document load the login plugin and the page plugin",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Set "Login plugin path" and "Page plugin paths"');
    await agent.act("Reload the page and look for the plugin's page menu");
    await agent.act("Sign out and read the login page");
  },
);

test(
  "clearing the settings sub-key leaves the other sub-keys of both documents untouched",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act("Edit the system announcement and save it");
    await agent.act('Press the toolbar "Reset" button and confirm it');
    await agent.act("Open the system announcement again");
  },
);

test(
  "sidebar, header and Downloads keys from the domain document",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn on "Enable Reservoir" and "Enable login session extension", and set "FastTrack URL"',
    );
    await agent.act("Read the sidebar menu items and the header");
  },
);

test(
  "maskUserInfo and enableInteractiveLoginAccountSwitch on the interactive-login page",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn on "Mask user information"');
    await agent.act(
      'Turn off "Account switch on SSO sign-in to an external service"',
    );
    await agent.act(
      "Open the interactive login page and read the account shown",
    );
  },
);

test(
  "allowThemeMode shows the theme family row in user settings",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn on "Theme customization"');
    await agent.act("Open user settings and look for the theme family row");
  },
);

test(
  "session launcher keys from the domain document",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn on "Custom image" and set "Maximum preopen ports" and "Default session image"',
    );
    await agent.act(
      "Open the session launcher and read its image and port fields",
    );
  },
);

test(
  "allowCustomResourceAllocation off hides custom allocation and showNonInstalledImages off filters installed images",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn off "Custom resource allocation" and "Show non-installed images"',
    );
    await agent.act(
      "Open the session launcher and read the resource and image options",
    );
  },
);

test(
  "folder explorer keys from the domain document",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Turn on "Show file sizes in the folder explorer" and set "Single upload file size limit"',
    );
    await agent.act("Open a folder in the folder explorer and read its rows");
  },
);

test(
  "defaultImportEnvironment is the environment of an imported notebook",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Set "Default import environment"');
    await agent.act("Import a notebook from a URL on the start page");
  },
);

test(
  "storageWarningThreshold from the domain document turns the diagnostics warning on",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act(
      'Lower "Storage usage warning threshold" below the current usage and press Enter',
    );
    await agent.act("Open the diagnostics page and read the storage checks");
  },
);

test(
  "allowSignupWithoutConfirmation from the public document controls the invitation token field",
  draft,
  async ({ app, agent }) => {
    await app.open("/admin/system-settings");
    await agent.act('Turn on "Auto-approve sign-ups"');
    await agent.act("Sign out and open the sign-up dialog");
  },
);

for (const enabled of [true, false]) {
  test(
    `app launcher and commit controls follow the domain document (${enabled ? "all on" : "all off"})`,
    draft,
    async ({ app, agent }) => {
      await app.open("/admin/system-settings");
      await agent.act(
        enabled
          ? 'Turn on "Public app access", "Preferred port", "Show TCP apps" and "Enable container commit"'
          : 'Turn off "Public app access", "Preferred port", "Show TCP apps" and "Enable container commit"',
      );
      await agent.act(
        "Open a running session's app launcher and its commit control",
      );
    },
  );
}
