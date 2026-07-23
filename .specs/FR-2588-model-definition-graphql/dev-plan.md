# Model Definition GraphQL Improvements Dev Plan

## Spec Reference
`.specs/FR-2588-model-definition-graphql/spec.md`

## Epic: FR-2588

## Sub-tasks (Implementation Order)

### 1. Display currentRevision.modelDefinition in EndpointDetailPage Service Info - FR-2590
- **GitHub Issue**: #6744
- **Changed files**: `react/src/pages/EndpointDetailPage.tsx`, `resources/i18n/en.json`, `resources/i18n/ko.json`
- **Dependencies**: None
- **Review complexity**: Medium
- **Branch**: `feat/FR-2590-endpoint-model-definition-display`
- **Stack base**: `04-16-feat_add_model_definition_graphql_improvement_spec`
- **Description**:
  - Add `deployment(id: $deploymentId) { currentRevision { modelDefinition { models { name, modelPath, service { startCommand, port, healthCheck { path, initialDelay, maxRetries } } } } } }` to `EndpointDetailPageQuery`
  - The query already has `$deploymentId: ID!` variable and `toGlobalId('ModelDeployment', serviceId)` — just need to add the `deployment` field
  - Add Descriptions items after existing items for: Model Name, Model Path, Start Command, Port, Health Check Path, Initial Delay, Max Retries
  - Guard with null checks: `currentRevision` may be null, `models` may be empty
  - Reuse existing i18n keys from `modelService.*` namespace (HealthCheck, InitialDelay, MaxRetries, Port) and `modelStore.*` (ModelName, ModelPath, StartCommand)
  - May need new i18n key for section header like "Model Definition" (already exists: `modelService.ModelDefinition`)

### 2. Replace vfolder YAML parsing with GraphQL query and add overwrite confirmation in edit mode - FR-2591
- **GitHub Issue**: #6745
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx`
- **Dependencies**: None
- **Review complexity**: High
- **Branch**: `feat/FR-2591-graphql-edit-and-overwrite-confirm`
- **Stack base**: `04-16-feat_add_model_definition_graphql_improvement_spec`
- **Description**:
  - **Feature 2 — GraphQL data load**: Replace `loadModelDefinitionForEdit` (lines 1339-1371) which does vfolder download + YAML parse with a GraphQL query using `deployment(id:) { currentRevision { modelDefinition { models { ... } } } }`. Use `fetchQuery` from relay-runtime since this is an imperative load triggered from useEffect, not a declarative render-time query. Map `models[0].service` fields to form: `startCommand`, `port` -> `commandPort`, `healthCheck.path` -> `commandHealthCheck`, `healthCheck.initialDelay` -> `commandInitialDelay`, `healthCheck.maxRetries` -> `commandMaxRetries`. Keep vfolder parsing as fallback when `modelDefinition` is null.
  - **Feature 3 — Overwrite confirmation**: In the `handleOk` edit mode flow (around line 966), add `modal.confirm` before uploading model-definition.yaml, matching the same pattern used in create mode (lines 642-657). Wrap upload in a `new Promise<boolean>` resolved by `onOk`/`onCancel`. If cancelled, abort via `throw new DOMException('User cancelled overwrite', 'AbortError')`.

## PR Stack Strategy
- Stack 1: Sub-task 1 (FR-2590) — EndpointDetailPage changes
- Stack 2: Sub-task 2 (FR-2591) — ServiceLauncherPageContent changes
- Both stacks branch from `04-16-feat_add_model_definition_graphql_improvement_spec`
- Stacks are fully independent and can be reviewed/merged in parallel

## Dependency Graph
```
FR-2590 (EndpointDetailPage display)     [independent]
FR-2591 (GraphQL edit + overwrite modal)  [independent]

Both can run in parallel — Wave 1 contains both tasks.
```

## Waves for batch-implement
- **Wave 1**: FR-2590, FR-2591 (parallel)

## Risks and Notes
- `currentRevision` field is marked "Added in UNRELEASED" in the schema — need `@since` directive or feature flag if backend version gating is required
- `startCommand` is `JSON!` type in GraphQL schema (not String) — need to handle serialization when displaying and when mapping to form field
- FR-2591 is High complexity due to replacing an imperative async flow with GraphQL and adding modal confirmation logic in the same mutation handler
