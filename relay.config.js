const baseConfig = require("./relay-base.config.js");

module.exports = {
  root: ".",
  sources: {
    "packages/backendai-ui": "backendai-ui",
    react: "react",
  },
  excludes: ["**/node_modules/**", "**/__mocks__/**", "**/__generated__/**"],
  projects: {
    "backendai-ui": {
      ...baseConfig,
      output: "packages/backendai-ui/src/__generated__",
      eagerEsModules: true,
    },
    react: {
      ...baseConfig,
      output: "react/src/__generated__",
      base: "backendai-ui",
    },
  },
};
