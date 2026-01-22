import { reactConfig } from "eslint-config-bai";
import storybookPlugin from "eslint-plugin-storybook";

export default [
  ...reactConfig,

  ...storybookPlugin.configs["flat/recommended"],

  {
    files: ["**/*.stories.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  {
    files: ["**/*.test.*", "**/*.stories.*"],
    rules: {
      "no-console": "off",
    },
  },

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];