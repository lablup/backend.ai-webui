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
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];

export default react;
