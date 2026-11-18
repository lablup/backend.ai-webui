import { test } from "@e2e-dev/web";

test(
  "the user asks the WebUI Assistant to change the dashboard",
  {
    session: "user",
    tags: ["draft"],
    skip: "draft: act-only flow from #11298, awaiting completion by automation",
  },
  async ({ app, agent }) => {
    await app.open("/dashboard");
    await agent.act(
      'Press the round "Open WebUI Assistant" button at the bottom right',
    );
    await agent.act(
      'Ask "Hide the resource presets card and move my sessions to the top" and send it',
    );
    await agent.act('Under "Dashboard changes" in the reply, press "Apply"');
  },
);
