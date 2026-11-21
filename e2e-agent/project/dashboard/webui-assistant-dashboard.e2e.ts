import { test } from "@e2e-dev/web";

test(
  "the user changes the dashboard through the WebUI Assistant chat",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/dashboard");
    await agent.act(
      "Open the WebUI Assistant from the round button at the bottom right",
    );
    await agent.act('Send "Hide the resource presets card" in the chat');
    await agent.act('Send "Add a table of running interactive sessions"');
    await agent.act('Send "Make that panel a count instead"');
    await agent.act('Press "Apply" above the chat input');
  },
);

test(
  "the user asks a WebUI question on the dashboard",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/dashboard");
    await agent.act(
      "Open the WebUI Assistant from the round button at the bottom right",
    );
    await agent.act('Press the example "How do I start a session?"');
  },
);

test(
  "the admin creates a board through the WebUI Assistant chat",
  {
    session: "admin",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/admin/dashboard");
    await agent.act(
      "Open the WebUI Assistant from the round button at the bottom right",
    );
    await agent.act(
      'Send "Create a board named Incidents with pending sessions and scheduling failures"',
    );
    await agent.act('Press "Apply" above the chat input');
  },
);
