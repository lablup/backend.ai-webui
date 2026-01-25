import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const base = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/__generated__/**",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    rules: {
      "no-console": "warn",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/prefer-namespace-keyword": "off",
      "no-useless-catch": "off",
      "no-empty": "off",
      "no-constant-condition": "off",
      "prefer-const": "off",
      "comma-spacing": "off",
      "prefer-promise-reject-errors": "off",
    },
  },
];

export default base;
