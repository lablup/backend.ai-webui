const baseConfig = require("./relay-base.config.js");

module.exports = {
  root: ".",
  sources: {
    "packages/backend.ai-ui/src": "backend.ai-ui",
    "react/src": "react",
  },
  excludes: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  projects: {
    "backend.ai-ui": {
      ...baseConfig,
      output: "packages/backend.ai-ui/src/__generated__",
      eagerEsModules: true,
    },
    react: {
      ...baseConfig,
      output: "react/src/__generated__",
      base: "backend.ai-ui",
    },
  },
};
