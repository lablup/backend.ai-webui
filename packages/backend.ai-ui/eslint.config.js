import { base, react } from "eslint-config-bai";
import storybookPlugin from "eslint-plugin-storybook";
import jsonSchemaValidator from "eslint-plugin-json-schema-validator";
import jsoncParser from "jsonc-eslint-parser";
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
    files: ["**/*.json"],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      "json-schema-validator": jsonSchemaValidator,
    },
    rules: {
      ...jsonSchemaValidator.configs.recommended.rules,
    },
  },

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];
