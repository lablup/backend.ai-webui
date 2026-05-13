import { base, react } from "eslint-config-bai";
import jsonSchemaValidator from "eslint-plugin-json-schema-validator";
import storybookPlugin from "eslint-plugin-storybook";
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
    files: ["src/locale/*.json"],
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

  // Branding-schema JSON assets (the JSON Schema itself + the example
  // theme files). They are not source code, but lint-staged passes them
  // through eslint anyway when they live under `src/`. Use the JSONC
  // parser so eslint accepts them; no rules are applied — the contents
  // are verified at runtime by the schema instead.
  {
    files: [
      "src/branding-schema/schema.json",
      "src/branding-schema/examples/*.json",
    ],
    languageOptions: {
      parser: jsoncParser,
    },
  },

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];
