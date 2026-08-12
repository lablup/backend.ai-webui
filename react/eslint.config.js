import { base, react } from 'eslint-config-bai';
import jsonSchemaValidator from 'eslint-plugin-json-schema-validator';
import relayPlugin from 'eslint-plugin-relay';
import globals from 'globals';
import jsoncParser from 'jsonc-eslint-parser';

// Shared base for `no-restricted-imports` so the per-file allowlist blocks
// below can re-declare the rule (flat-config rule configs replace, not merge)
// without duplicating these entries.
const restrictedImportPatterns = [
  // `locale` is a published export-map alias (→ dist/locale/*), not a deep
  // reach into package internals.
  {
    group: ['backend.ai-ui/*', '!backend.ai-ui/dist', '!backend.ai-ui/locale'],
  },
];
const restrictedImportPaths = [
  {
    name: 'react-router-dom',
    importNames: ['useNavigate', 'Navigate'],
    message:
      "Use 'useWebUINavigate' from 'src/hooks' or '<WebUINavigate>' from 'src/components/WebUINavigate' instead.",
  },
];

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
            ...restrictedImportPatterns,
            // FR-3428: the URL owns the current project on
            // `/project/:projectName/*` routes (FR-3055). Writing
            // `currentProjectAtom` directly from a component leaves the URL on
            // the old project (sider links, reloads, and the next navigation
            // snap back). Components must switch projects through
            // `useSwitchProject` from 'src/hooks/useRouteScope', which applies
            // the scope rule; the raw setter is reserved for the URL→atom sync
            // layer (see the allowlist block below).
            {
              group: ['**/useCurrentProject'],
              importNames: ['useSetCurrentProject'],
              message:
                "Use 'useSwitchProject' from 'src/hooks/useRouteScope' instead — the URL owns the current project on project-scoped routes (FR-3055/FR-3428).",
            },
          ],
          paths: restrictedImportPaths,
        },
      ],
      // CSP: a raw <style> element carries no nonce and is dropped by a strict
      // `style-src 'nonce-...'` policy. Import a co-located .css file instead
      // (bundled, same-origin, covered by `style-src 'self'`) — to-astryx
      // ticket 33 retired the antd-style escape hatch this rule used to point
      // at. Values that must vary at runtime go through CSS custom properties
      // set inline or via `element.style.setProperty` (CSSOM writes are not
      // intercepted by CSP).
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='style']",
          message:
            'Direct <style> elements are forbidden (CSP nonce safety). Import a co-located .css file instead, and drive runtime-variable values through CSS custom properties.',
        },
      ],
    },
  },

  {
    // Allowlist for the raw `useSetCurrentProject` setter (FR-3428):
    //  - useCurrentProject.tsx / useRouteScope.ts — the setter's home module
    //    and the `useSwitchProject` implementation.
    //  - ProjectScopeLayout.tsx — the URL→atom sync layer that converges the
    //    atom to the `:projectName` URL segment.
    //  - WebUIHeader.tsx — the admin-mode-exit confirm flow, which must set
    //    the atom AND navigate to a goBackPath-derived target in one step.
    files: [
      'src/hooks/useCurrentProject.tsx',
      'src/hooks/useRouteScope.ts',
      'src/components/MainLayout/ProjectScopeLayout.tsx',
      'src/components/MainLayout/WebUIHeader.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: restrictedImportPatterns,
          paths: restrictedImportPaths,
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
    ignores: [
      '**/__generated__/**',
      'build/**',
      '**/*.tsx_',
      '**/*.ts_',
      // `astryx theme build` artifacts (see src/astryx-theme/built/index.ts).
      // verify.sh byte-compares them against the CLI output, so linters must
      // not touch them (same policy as prettierignore/.gitattributes).
      'src/astryx-theme/built/bai-r*',
    ],
  },
];
