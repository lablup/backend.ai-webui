// Bundle targets compared per PR (ADR 0041).
const SHARED_INPUTS = [
  "relay.config.js",
  "relay-base.config.js",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".npmrc",
];

export const TARGETS = [
  {
    id: "webui",
    kind: "app",
    build: "pnpm run build:react-only",
    outDir: "react/build",
    inputs: [
      "react",
      "packages/backend.ai-ui",
      "packages/backend.ai-client",
      "resources",
      "data",
      ...SHARED_INPUTS,
    ],
  },
  {
    id: "backend.ai-ui",
    kind: "library",
    build: "pnpm --filter backend.ai-ui build",
    outDir: "packages/backend.ai-ui/dist",
    inputs: ["packages/backend.ai-ui", ...SHARED_INPUTS],
  },
];

export const TOOLCHAIN_PATHS = [
  ".nvmrc",
  ".github/actions/setup-node-pnpm",
  ".github/scripts/bundle-size",
  "scripts/bundle-budget.mjs",
  ".github/workflows/bundle-size.yml",
];
