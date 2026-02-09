import { base, react } from "eslint-config-bai";
import relayPlugin from "eslint-plugin-relay";
import storybookPlugin from "eslint-plugin-storybook";
import globals from "globals";

export default [
  ...base,
  ...react,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2016,
      },
    },
  },

  {
    plugins: {
      relay: relayPlugin,
    },
    rules: {
      "relay/graphql-syntax": "off",
      "relay/unused-fields": "off",
      "relay/must-colocate-fragment-spreads": "off",
    },
  },

  ...storybookPlugin.configs["flat/recommended"],

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "backend.ai-ui/*",
            "!backend.ai-ui/dist",
            "@lobehub/fluent-emoji",
          ],
          paths: [
            {
              name: "antd-style",
              importNames: ["useThemeMode"],
              message: "Use 'src/hooks/useThemeMode' instead.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["**/*.test.*", "**/*.stories.*"],
    rules: {
      "no-console": "off",
    },
  },

  {
    files: ["**/*.test.*", "**/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  {
    ignores: ["**/__generated__/**", "build/**", "**/*.tsx_", "**/*.ts_"],
  },
];
