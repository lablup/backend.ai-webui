import { base } from "eslint-config-bai";
import globals from "globals";

export default [
  ...base,

  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },

  {
    rules: {
      "no-console": "off",
      "no-empty-pattern": "off",
    },
  },
];
