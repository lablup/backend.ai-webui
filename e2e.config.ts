import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { web } from "@e2e-dev/web";
import * as dotenv from "dotenv";
import type { E2EConfig } from "e2e";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  e2eAgentPartGlobs,
  e2ePartOutputName,
  e2eRunLine,
  resolveE2EEnvFile,
  resolveE2EParts,
} from "./e2e/e2e-parts";
import {
  lnaBypassEndpoint,
  needsLnaBypass,
} from "./e2e-agent/utils/lna-browser";

// E2E_PART picks the part folders of e2e-agent/ and E2E_ENV_FILE the env file,
// by the same rule as playwright.config.ts (e2e/e2e-parts.ts): a part list
// with `admin` reads .env.playwright.admin. One run talks to one server.
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const requestedPart = process.env.E2E_PART;
const requestedEnvFile = process.env.E2E_ENV_FILE;
const e2eParts = resolveE2EParts(requestedPart);
const e2eEnvFile = resolveE2EEnvFile(e2eParts, requestedEnvFile, {
  root: rootDir,
});
// A chosen env file wins over exported E2E_* values, so a shell set up for
// the user server cannot leak into the admin part; the default keeps them.
const chosenEnvFile = Boolean(requestedEnvFile) || e2eParts.includes("admin");
dotenv.config({ path: e2eEnvFile, override: chosenEnvFile, quiet: true });
// .env.e2e-agent (the model) overrides the env file. With a chosen env file it
// must not carry the server, the app URL, accounts or the image: those belong
// to that file (an exported E2E_AGENT_APP_URL still picks the app).
const agentEnvFile = path.resolve(rootDir, "e2e/envs/.env.e2e-agent");
const agentEnv = fs.existsSync(agentEnvFile)
  ? dotenv.parse(fs.readFileSync(agentEnvFile))
  : {};
const serverKeys = Object.keys(agentEnv).filter((key) =>
  /^E2E_(WEBUI_ENDPOINT|WEBSERVER_ENDPOINT|AGENT_APP_URL|DEFAULT_IMAGE|[A-Z0-9_]+_(EMAIL|PASSWORD))$/.test(
    key,
  ),
);
if (chosenEnvFile && serverKeys.length > 0) {
  throw new Error(
    `e2e/envs/.env.e2e-agent sets ${serverKeys.join(", ")}, which would ` +
      `replace ${path.relative(rootDir, e2eEnvFile)}; move them there`,
  );
}
Object.assign(process.env, agentEnv);
// Workers re-evaluate this file, so an env file must not change the selection.
for (const [key, value] of [
  ["E2E_PART", requestedPart],
  ["E2E_ENV_FILE", requestedEnvFile],
] as const) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

const { E2E_LLM_BASE_URL, E2E_LLM_API_KEY, E2E_LLM_MODEL } = process.env;
// Without an endpoint and model, agent.* steps fail with MODEL_UNAVAILABLE.
const model =
  E2E_LLM_BASE_URL && E2E_LLM_MODEL
    ? createOpenAICompatible({
        name: "llm",
        baseURL: E2E_LLM_BASE_URL,
        apiKey: E2E_LLM_API_KEY,
      }).chatModel(E2E_LLM_MODEL)
    : undefined;

const appUrl =
  process.env.E2E_AGENT_APP_URL ??
  process.env.E2E_WEBUI_ENDPOINT ??
  "https://backend-ai-webui.localhost:1355";

// Workers inherit the variable, so the line is printed once per selection.
const runLine = e2eRunLine(
  e2eParts,
  e2eEnvFile,
  rootDir,
  appUrl,
  process.env.E2E_WEBSERVER_ENDPOINT,
);
if (
  (requestedPart || requestedEnvFile) &&
  process.env.E2E_AGENT_PART_LOGGED !== runLine
) {
  process.env.E2E_AGENT_PART_LOGGED = runLine;
  console.error(runLine);
}

export default {
  tests: e2eAgentPartGlobs(e2eParts),
  // One results directory per part, so one part's run keeps the other's.
  ...(!e2eParts.includes("all") && {
    output: `.e2e/${e2ePartOutputName(e2eParts)}`,
  }),
  targets: [
    {
      name: "chromium",
      engine: web({
        locale: "en-US",
        ...(needsLnaBypass(appUrl, process.env.E2E_WEBSERVER_ENDPOINT) && {
          connect: { cdpEndpoint: lnaBypassEndpoint },
        }),
      }),
      app: { url: appUrl },
    },
  ],
  timeout: 180_000,
  agents: {
    default: {
      model,
      system: "You are a thorough QA agent. Verify every outcome on screen.",
      context:
        "The app is the Backend.AI WebUI, a console for running compute sessions, storage folders and model services on a Backend.AI cluster. The left side menu lists the pages.",
    },
  },
  credentials: {
    admin: {
      username: process.env.E2E_ADMIN_EMAIL ?? "",
      password: () => process.env.E2E_ADMIN_PASSWORD ?? "",
    },
  },
} satisfies E2EConfig;
