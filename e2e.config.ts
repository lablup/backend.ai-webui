import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { web } from "@e2e-dev/web";
import * as dotenv from "dotenv";
import type { E2EConfig } from "e2e";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  DEFAULT_E2E_ENV_FILE,
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
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const requestedPart = process.env.E2E_PART;
const requestedEnvFile = process.env.E2E_ENV_FILE;
const e2eParts = resolveE2EParts(requestedPart);
const e2eEnvFile = resolveE2EEnvFile(e2eParts, requestedEnvFile, rootDir);
const defaultEnvFile = path.resolve(rootDir, DEFAULT_E2E_ENV_FILE);
// A chosen env file wins over exported E2E_* values, so a shell set up for
// the user server cannot leak into the admin part; the default keeps them.
const chosenEnvFile = e2eEnvFile !== defaultEnvFile;
dotenv.config({ path: e2eEnvFile, override: chosenEnvFile, quiet: true });
// .env.e2e-agent (model, app URL) overrides the env file. With a chosen env
// file it must not carry the server or accounts, which belong to that file.
const agentEnvFile = path.resolve(rootDir, "e2e/envs/.env.e2e-agent");
const agentEnv = fs.existsSync(agentEnvFile)
  ? dotenv.parse(fs.readFileSync(agentEnvFile))
  : {};
const serverKeys = Object.keys(agentEnv).filter((key) =>
  /^E2E_(WEBUI_ENDPOINT|WEBSERVER_ENDPOINT|[A-Z0-9]+_(EMAIL|PASSWORD))$/.test(
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

if ((requestedPart || requestedEnvFile) && !process.env.E2E_AGENT_PART_LOGGED) {
  // Workers inherit the variable, so the line is printed once per run.
  process.env.E2E_AGENT_PART_LOGGED = "1";
  const host = (url?: string) => {
    try {
      return new URL(url ?? "").host;
    } catch {
      return "(unset)";
    }
  };
  console.error(
    `[e2e] part=${e2eParts.join(",")} env=${path.relative(rootDir, e2eEnvFile)}` +
      ` app=${host(appUrl)} webserver=${host(process.env.E2E_WEBSERVER_ENDPOINT)}`,
  );
}

export default {
  tests: e2eAgentPartGlobs(e2eParts),
  // One results directory per part, so one part's run keeps the other's.
  ...(!e2eParts.includes("all") && { output: `.e2e/${e2eParts.join("-")}` }),
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
