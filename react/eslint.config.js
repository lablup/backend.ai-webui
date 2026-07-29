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

  // FR-3414 / FR-3415 (ADR-0001): the project-agnostic surface — the whole `/admin/*`
  // subtree except the pages that still genuinely depend on the ambient
  // project — operates above project scope, so its sources must never read
  // the ambient current project. Converted components receive the decision
  // via their required `project` prop instead. This list must stay in sync
  // with `PROJECT_AGNOSTIC_MENU_KEYS`
  // (react/src/helper/projectAgnosticRoutes.ts); the mapping from menu key to
  // page component is:
  //   admin-session      -> AdminSessionPage / AdminComputeSessionListPage
  //   admin-deployments  -> AdminDeployment*Page / AdminModelCardListPage
  //   admin-data         -> AdminVFolderNodeListPage
  //   credential         -> AdminUsersPage
  //   resource-policy    -> ResourcePolicyPage
  //   scheduler          -> SchedulerPage
  //   agent              -> ResourcesPage
  //   project            -> ProjectPage
  //   settings           -> ConfigurationsPage
  //   maintenance        -> MaintenancePage
  //   diagnostics        -> DiagnosticsPage
  //   rbac               -> RBACManagementPage
  //   branding           -> BrandingPage
  //   information        -> components/Information
  //   environment        -> EnvironmentPage                        (FR-3415)
  //   reservoir          -> ReservoirPage / ReservoirArtifactDetailPage
  //                                                                (FR-3415)
  // NOTE: this block redeclares `no-restricted-imports`, which REPLACES the
  // global options above for these files, so the global paths/patterns are
  // repeated here (patterns must be all-strings or all-objects, hence the
  // object form).
  // Only `admin-dashboard` (AdminDashboardPage) stays excluded — it still
  // reads ambient state and is not gated by `PROJECT_AGNOSTIC_MENU_KEYS`
  // either. DeploymentDetailPage is excluded because it serves three URL
  // spaces and is the sanctioned page-level ambient reader (see the ADR).
  {
    files: [
      'src/pages/AdminSessionPage.tsx',
      'src/pages/AdminComputeSessionListPage.tsx',
      'src/pages/AdminVFolderNodeListPage.tsx',
      'src/pages/AdminDeploymentListPage.tsx',
      'src/pages/AdminDeploymentPresetListPage.tsx',
      'src/pages/AdminDeploymentPresetSettingPage.tsx',
      'src/pages/AdminModelCardListPage.tsx',
      'src/components/PendingSessionNodeList.tsx',
      'src/pages/AdminUsersPage.tsx',
      'src/pages/ResourcePolicyPage.tsx',
      'src/pages/SchedulerPage.tsx',
      'src/pages/ResourcesPage.tsx',
      'src/pages/ProjectPage.tsx',
      'src/pages/ConfigurationsPage.tsx',
      'src/pages/MaintenancePage.tsx',
      'src/pages/DiagnosticsPage.tsx',
      'src/pages/RBACManagementPage.tsx',
      'src/pages/BrandingPage.tsx',
      'src/components/Information.tsx',
      'src/pages/EnvironmentPage.tsx',
      'src/pages/ReservoirPage.tsx',
      'src/pages/ReservoirArtifactDetailPage.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'backend.ai-ui/*',
                '!backend.ai-ui/dist',
                '@lobehub/fluent-emoji',
              ],
            },
            {
              group: ['**/useCurrentProject'],
              importNames: ['useCurrentProjectValue'],
              message:
                'Project-agnostic surfaces have no ambient project context (ADR-0001, docs/adr/0001-explicit-project-prop-contract.md). ' +
                'Pass an explicit `project` prop (or `null` + in-modal selection) instead of reading the ambient current project.',
            },
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
