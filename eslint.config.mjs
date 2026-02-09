import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import wcPlugin from 'eslint-plugin-wc';
import litA11yPlugin from 'eslint-plugin-lit-a11y';
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import jsoncParser from 'jsonc-eslint-parser';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'docs/**',
      'src/app/**',
      'src/plugin*/**',
      'src/wsproxy*/**',
      'src/plastics/**',
      'src/types/**',
      'src/lib/**',
      'packages/eslint-config-bai/**',
      'react/**',
      'packages/**',
      'build/**',
    ],
  },

  // ESLint recommended
  eslint.configs.recommended,

  // Base config for TypeScript files
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: true,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'wc': wcPlugin,
      'lit-a11y': litA11yPlugin,
    },
    rules: {
      // @typescript-eslint/recommended rules
      ...tseslint.configs.recommended.rules,

      // wc/recommended rules
      ...wcPlugin.configs.recommended.rules,

      // wc/best-practice rules
      ...wcPlugin.configs['best-practice'].rules,

      // lit-a11y/recommended rules
      ...litA11yPlugin.configs.recommended.rules,

      // Overrides from original config
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'object-curly-spacing': 'off',
      'curly': 'off',
      'operator-linebreak': 'off',
      'indent': 'off',
      'no-undef': 'off',
      'no-constant-condition': 'off',
      'no-inner-declarations': 'off',
      'no-irregular-whitespace': 'off',
      'max-len': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'require-jsdoc': 'off',
      'valid-jsdoc': 'off',
      'camelcase': 'off',
      'no-empty': 'off',
      'no-empty-function': 'off',
      'no-invalid-this': 'off',
      'wc/guard-super-call': 'off',
      'lit-a11y/alt-text': 'off',
      'spaced-comment': 'off',
      'quotes': 'off',
      'quote-props': 'off',
      'space-before-function-paren': 'off',
    },
  },

  // JSON files config
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      'json-schema-validator': jsonSchemaValidator,
    },
    rules: {
      ...jsonSchemaValidator.configs.recommended.rules,
    },
  },
];
