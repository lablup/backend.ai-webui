import { reactConfig } from "eslint-config-bai";
import storybookPlugin from "eslint-plugin-storybook";
import globals from "globals";

export default [
  ...reactConfig,

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

  ...storybookPlugin.configs["flat/recommended"],

  {
    files: ["**/*.stories.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  {
    files: ["**/*.test.*", "**/*.stories.*", "**/__test__/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
    },
  },

  {
    files: ["**/*.snap"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        exports: "writable",
      },
    },
  },

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];
