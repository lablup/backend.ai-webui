import { test } from "@e2e-dev/web";

test(
  "the user asks the WebUI Assistant to change the dashboard in edit mode",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/dashboard");
    await agent.act('Press "Edit" above the dashboard');
    await agent.act(
      'In "Edit with WebUI Assistant", type "Hide the resource presets card" and press "Propose"',
    );
    await agent.act('Press "Apply" under the proposed changes');
  },
);

test(
  "the user describes a custom panel and adds it",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/dashboard");
    await agent.act('Press "Edit" above the dashboard');
    await agent.act('Under "Custom panels", press "Add"');
    await agent.act(
      'In "Describe the panel", type "Running interactive sessions as a table" and press "Fill in"',
    );
    await agent.act('Press "Add" to add the panel');
  },
);
