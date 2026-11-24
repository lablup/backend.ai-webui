import { test } from "@e2e-dev/web";

test(
  "the user turns on the WebUI Assistant, connects it to a deployment and asks a question",
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
      'In the "Connect WebUI Assistant" dialog, choose a running deployment in the "Deployment" field',
    );
    await agent.act(
      'If a "Token" field appears for a private deployment, choose one of its tokens',
    );
    await agent.act('Press "Connect"');
    await agent.act('Ask "How do I mount a folder to a session?" and send it');
  },
);

test(
  "the user connects the WebUI Assistant to a custom OpenAI-compatible endpoint",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from the WebUI Assistant PR, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/start");
    await agent.act(
      'Press the round "Open WebUI Assistant" button at the bottom right',
    );
    await agent.act(
      'In the "Connect WebUI Assistant" dialog, switch to "Custom endpoint"',
    );
    await agent.act('Enter the endpoint in "Base URL" and its "API key"');
    await agent.act('Press "Connect"');
  },
);
