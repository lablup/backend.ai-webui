import { base, react } from 'eslint-config-bai';
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import relayPlugin from 'eslint-plugin-relay';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  ...base,
  ...react,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2016,
      },
    },
  },

  {
    plugins: {
      relay: relayPlugin,
    },
    rules: {
      'relay/graphql-syntax': 'off',
      'relay/unused-fields': 'off',
      'relay/must-colocate-fragment-spreads': 'off',
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'backend.ai-ui/*',
            '!backend.ai-ui/dist',
            '@lobehub/fluent-emoji',
          ],
          paths: [
            {
              name: 'antd-style',
              importNames: ['useThemeMode'],
              message: "Use 'src/hooks/useThemeMode' instead.",
            },
            {
              name: 'react-router-dom',
              importNames: ['useNavigate', 'Navigate'],
              message:
                "Use 'useWebUINavigate' from 'src/hooks' or '<WebUINavigate>' from 'src/components/WebUINavigate' instead.",
            },
          ],
        },
      ],
      // CSP: a raw <style> element carries no nonce and is dropped by a strict
      // `style-src 'nonce-...'` policy. Use createGlobalStyle / createStyles
      // from 'antd-style' (nonce'd via the <StyleProvider> in DefaultProviders)
      // for dynamic/global CSS, or import an external .css file (covered by
      // `style-src 'self'`) for static CSS.
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='style']",
          message:
            "Direct <style> elements are forbidden (CSP nonce safety). Use createGlobalStyle/createStyles from 'antd-style', or import an external .css file.",
        },
      ],
    },
  },

  {
    files: ['**/*.test.*'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.test.*', '**/__tests__/**'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

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

  {
    ignores: ['**/__generated__/**', 'build/**', '**/*.tsx_', '**/*.ts_'],
  },
];
