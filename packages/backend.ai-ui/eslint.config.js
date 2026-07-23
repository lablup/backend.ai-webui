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

  // Enforce that BUI components access translations through the internal
  // `useBAIi18n` hook only. Direct imports of i18n primitives from
  // `react-i18next` would re-introduce React-Context-based lookup, which
  // (under pnpm dedup) shadows the host app's i18n and surfaces raw keys
  // on screen — the exact class of bug FR-2986 eliminates.
  //
  // All three banned bindings (`useTranslation` hook, `withTranslation` HOC,
  // `<Translation>` render-prop) are different injection mechanisms for the
  // same thing — a Context-derived `t`. The project is fully function-
  // component / hook-based (`'use memo'` directive), so `useBAIi18n()` is
  // the single replacement for all three; we do not maintain a separate
  // BUI-instance-bound HOC or render-prop component.
  //
  // `useBAIi18n.ts` and `BAITrans.tsx` are exempted because they are the
  // two places that are *allowed* to call into `react-i18next` directly
  // (with explicit `{ i18n }` binding). Every other BUI source file routes
  // i18n access through them.
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/hooks/useBAIi18n.ts",
      "src/components/BAITrans.tsx",
      "**/*.test.*",
      "**/*.stories.*",
      "**/__test__/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-i18next",
              importNames: [
                "useTranslation",
                "withTranslation",
                "Translation",
                "Trans",
                "I18nextProvider",
              ],
              message:
                "Use `useBAIi18n` from `<relative path>/hooks/useBAIi18n` (replaces useTranslation / withTranslation / Translation) or `BAITrans` from `<relative path>/components/BAITrans` (replaces <Trans>) instead. BUI components must bind explicitly to BUI's i18n instance — see FR-2986 / packages/backend.ai-ui/src/hooks/useBAIi18n.ts.",
            },
          ],
        },
      ],
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

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];
