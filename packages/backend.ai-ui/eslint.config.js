import { base, react } from "eslint-config-bai";
import jsonSchemaValidator from "eslint-plugin-json-schema-validator";
import storybookPlugin from "eslint-plugin-storybook";
import jsoncParser from "jsonc-eslint-parser";
import globals from "globals";
import fs from "node:fs";

// Embedded inline (not referenced by path) so the schema CONTENT is part of
// the resolved config: editing i18n.schema.json then invalidates `--cache`d
// lint results for the locale files, which a `$schema` path alone would not.
// ADR 0009: Astryx is reached only through its @lablup/ui-common mirror.
const astryxImportBan = {
  group: ["@astryxdesign/*"],
  message:
    "Import Astryx through @lablup/ui-common: @astryxdesign/core/<X> -> @lablup/ui-common/<X>, @astryxdesign/lab -> @lablup/ui-common/lab (ADR 0009).",
};
// Files the Astryx CLI writes or reads keep the real @astryxdesign/* ids.
const astryxImportBanExempt = [
  "src/**/*.doc.ts",
  "src/astryx-docs/**",
  "src/astryx-theme-augmentations.d.ts",
];
// `no-restricted-imports` sees only static imports and re-exports.
const astryxDynamicImportBan = [
  "ImportExpression[source.value=/^@astryxdesign\\u002F/]",
  "ImportExpression > TemplateLiteral.source[quasis.0.value.cooked=/^@astryxdesign\\u002F/]",
  "CallExpression[callee.name='require'][arguments.0.value=/^@astryxdesign\\u002F/]",
  "TSImportType[argument.literal.value=/^@astryxdesign\\u002F/]",
].map((selector) => ({
  selector,
  message:
    "Import Astryx through @lablup/ui-common, dynamic imports and require() included (ADR 0009).",
}));
// A rule config replaces, never merges, so the shared config's own
// `no-restricted-syntax` entries are carried into the block that adds these.
const baseRestrictedSyntax = react.flatMap(
  (config) => config.rules?.["no-restricted-syntax"]?.slice(1) ?? [],
);

const i18nSchema = JSON.parse(
  fs.readFileSync(new URL("./i18n.schema.json", import.meta.url), "utf8"),
);

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
    files: ["src/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    ignores: [
      "src/hooks/useBAIi18n.ts",
      "src/components/BAITrans.tsx",
      "**/*.test.*",
      "**/*.stories.*",
      "**/__test__/**",
      ...astryxImportBanExempt,
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [astryxImportBan],
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

  // The files the block above exempts from the react-i18next ban still get
  // the Astryx ban (a later block's rule config replaces an earlier one's).
  {
    files: [
      "src/hooks/useBAIi18n.ts",
      "src/components/BAITrans.tsx",
      "**/*.test.*",
      "**/*.stories.*",
      "**/__test__/**",
      ".storybook/**/*.{ts,tsx,js,jsx,mjs,cjs}",
    ],
    ignores: astryxImportBanExempt,
    rules: {
      "no-restricted-imports": ["error", { patterns: [astryxImportBan] }],
    },
  },

  {
    files: [
      "src/**/*.{ts,tsx,js,jsx,mjs,cjs}",
      ".storybook/**/*.{ts,tsx,js,jsx,mjs,cjs}",
    ],
    ignores: astryxImportBanExempt,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...baseRestrictedSyntax,
        ...astryxDynamicImportBan,
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
      "json-schema-validator/no-invalid": [
        "error",
        {
          schemas: [
            { fileMatch: ["**/src/locale/*.json"], schema: i18nSchema },
          ],
        },
      ],
    },
  },

  {
    ignores: ["**/*.graphql.*", "dist/**"],
  },
];
