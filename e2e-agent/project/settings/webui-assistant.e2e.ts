import { test } from "@e2e-dev/web";

test(
  "the user turns on the WebUI Assistant and asks it a question",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from the WebUI Assistant PR, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open User Settings from the user menu in the header");
    await agent.act('Under "Experimental features", turn on "WebUI Assistant"');
    await agent.act("Close User Settings");
    await agent.act(
      'Press the round "Open WebUI Assistant" button at the bottom right',
    );
    await agent.act(
      'In the "Start WebUI Assistant" dialog, choose a chat model in the "Model" field',
    );
    await agent.act('Press "Start model"');
    await agent.act(
      "If a preset and resource group are asked for, keep the defaults and deploy",
    );
    await agent.act('Ask "How do I mount a folder to a session?" and send it');
  },
);

test(
  "the user turns off the WebUI Assistant and deletes its deployment",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from the WebUI Assistant PR, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act("Open User Settings from the user menu in the header");
    await agent.act(
      'Under "Experimental features", turn off "WebUI Assistant"',
    );
    await agent.act(
      'In the "Turn off WebUI Assistant" dialog, keep "Also delete the assistant\'s deployment" checked and press "Turn off"',
    );
  },
);
