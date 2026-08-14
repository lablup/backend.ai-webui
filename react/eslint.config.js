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
      'src/pages/AdminDeploymentPage.tsx',
      'src/pages/AdminDeploymentPresetSettingPage.tsx',
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
    // Allowlist for the raw `useSetCurrentProject` setter (FR-3428):
    //  - useCurrentProject.tsx / useRouteScope.ts — the setter's home module
    //    and the `useSwitchProject` implementation.
    //  - ProjectScopeLayout.tsx — the URL→atom sync layer that converges the
    //    atom to the `:projectName` URL segment.
    //  - WebUIHeaderProjectSelect.tsx — the admin-mode-exit confirm flow, which
    //    must set the atom AND navigate to a goBackPath-derived target in one
    //    step. Extracted out of WebUIHeader.tsx in FR-3414 so the header can
    //    skip mounting it entirely on project-agnostic routes.
    files: [
      'src/hooks/useCurrentProject.tsx',
      'src/hooks/useRouteScope.ts',
      'src/components/MainLayout/ProjectScopeLayout.tsx',
      'src/components/MainLayout/WebUIHeaderProjectSelect.tsx',
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
