import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";

export const react = [
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  reactHooksPlugin.configs.flat["recommended-latest"],

  {
    rules: {
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "useRecoilCallback",
        },
      ],
      // React-Compiler-powered diagnostics that eslint-plugin-react-hooks
      // 7.1.x newly detects in 60+ pre-existing spots across react/ and
      // backend.ai-ui (7.0.x shipped the same rules but its bundled compiler
      // did not flag these patterns, so they were never enforced in practice).
      // The lockfile resolves 7.0.1 for this package but 7.1.1 in CI's fresh
      // install, which made lint results env-dependent (FR-3337). Disabled
      // explicitly so both resolutions behave identically; FR-3338 tracks
      // fixing the violations and re-enabling these rules.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/use-memo": "off",
    },
  },

  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-duplicates": "error",
    },
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector: "ImportDeclaration[source.value=/^src\\u002F.+/]",
          message:
            "Use a relative import path instead of 'src/...'. Mixing absolute and relative paths in the same file is inconsistent; prefer relative paths.",
        },
      ],
    },
  },

  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

export default react;
