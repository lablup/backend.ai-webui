import { test } from "@e2e-dev/web";

const draft = {
  session: "admin",
  tags: ["draft"],
  skip: "draft: act-only flow from #11383, awaiting completion by automation",
};

test(
  "the launcher caps the resource inputs at the resource group capacity",
  draft,
  async ({ app, agent }) => {
    await app.open("/session/start");
    await agent.act('Go to the "Resource allocation" step');
    await agent.act(
      "Read the largest CPU, memory and GPU values the inputs and sliders accept",
    );
  },
);

test(
  "the launcher blocks the resource inputs in a resource group without resources",
  draft,
  async ({ app, agent }) => {
    await app.open("/session/start");
    await agent.act('Go to the "Resource allocation" step');
    await agent.act("Select a resource group that has no agents");
    await agent.act(
      'Read the "No resources are available." alert and try to change the CPU value',
    );
  },
);

test(
  "the launcher offers a retry when the resource information fails to load",
  draft,
  async ({ app, agent }) => {
    await app.open("/session/start");
    await agent.act('Go to the "Resource allocation" step');
    await agent.act(
      `Press "Retry" in the "Couldn't load the resource information." alert`,
    );
  },
);
