import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { web } from "@e2e-dev/web";
import * as dotenv from "dotenv";
import type { E2EConfig } from "e2e";
import {
  e2eAgentPartGlobs,
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
const e2eParts = resolveE2EParts(process.env.E2E_PART);
const e2eEnvFile = resolveE2EEnvFile(e2eParts, process.env.E2E_ENV_FILE);
// .env.e2e-agent overrides the env file (accounts, backend).
dotenv.config({ path: e2eEnvFile, quiet: true });
dotenv.config({
  path: "./e2e/envs/.env.e2e-agent",
  override: true,
  quiet: true,
});

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

export default {
  tests: e2eAgentPartGlobs(e2eParts),
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
