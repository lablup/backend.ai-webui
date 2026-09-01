# Runtime UI Improvement Dev Plan

## Spec Reference
`.specs/runtime-ui-improvement/spec.md`

## Jira Epic: [FR-2547](https://lablup.atlassian.net/browse/FR-2547)

## Sub-tasks (Implementation Order)

### 1. Change default runtime variant from vllm to custom — [#6709](https://github.com/lablup/backend.ai-webui/issues/6709)
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx`, `react/src/hooks/useModelServiceLauncher.ts`, `react/src/components/LegacyModelTryContentButton.tsx`
- **Dependencies**: None
- **Review complexity**: Low
- **Description**: Replace hardcoded `runtimeVariant: 'vllm'` with `runtimeVariant: 'custom'` in all three default value locations. Consider extracting to a shared constant. Simple string replacement with no logic changes.

### 2. Add RuntimeVariantPresets GraphQL query and refactor parameter schema hook — [#6710](https://github.com/lablup/backend.ai-webui/issues/6710)
- **Changed files**: `react/src/hooks/useRuntimeParameterSchema.ts`, `react/src/components/RuntimeParameterFormSection.tsx`, `react/src/hooks/useVariantConfigs.ts`, new Relay query file(s)
- **Dependencies**: Sub-task 1 (#6709 blocks #6710)
- **Review complexity**: High
- **Description**: Create Relay query for `runtimeVariantPresets` API with full field selection (targetSpec, uiOption, category, rank, displayName). Rewrite `useRuntimeParameterSchema` to fetch from API instead of hardcoded `RUNTIME_PARAMETER_FALLBACKS`. Need to resolve `runtimeVariantId` UUID from variant name (query `runtimeVariants` or use the variant's `rowId`). Update `RuntimeParameterFormSection` to render dynamic categories from API (backend provides 9 categories like `model_loading`, `resource_memory`, etc.) instead of hardcoded `sampling`/`context`/`advanced`. Update `ParameterControl` to use `uiOption` config (slider min/max/step from `uiOption.slider`, select options from `uiOption.choices`). Add error handling for API failures.

### 3. Refactor service launcher serialization to use API targetSpec and remove hardcoded fallbacks — [#6711](https://github.com/lablup/backend.ai-webui/issues/6711)
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx` (6 call sites), `react/src/helper/runtimeExtraArgsParser.ts`, `react/src/helper/runtimeExtraArgsParser.test.ts`, `react/src/hooks/useVariantConfigs.test.ts`, **delete** `react/src/constants/runtimeParameterFallbacks.ts`
- **Dependencies**: Sub-task 2 (#6710 blocks #6711)
- **Review complexity**: High
- **Description**: Refactor the 6 serialization call sites in `ServiceLauncherPageContent.tsx` that use `getExtraArgsEnvVar`/`getAllExtraArgsEnvVars`/`RUNTIME_PARAMETER_FALLBACKS` to use the API's `targetSpec.presetTarget` for ENV vs ARGS determination. Parameters with `presetTarget=ENV` become individual env vars; parameters with `presetTarget=ARGS` are serialized into the runtime's EXTRA_ARGS. Replace hardcoded `EXTRA_ARGS_ENV_MAP` with dynamic derivation from API presets. Delete `runtimeParameterFallbacks.ts` entirely. Update tests.

## PR Stack Strategy
- Sequential: 1 -> 2 -> 3
- Stack name: `feat/runtime-ui-improvement`

## Dependency Graph
```
#6709 (default runtime) ──blocks──> #6710 (GraphQL + hook) ──blocks──> #6711 (serialization + cleanup)
```

## Key Implementation Notes

### RuntimeVariantId Resolution
The `runtimeVariantPresets` API filters by `runtimeVariantId` (UUID), but the frontend currently works with variant names (e.g., `'vllm'`, `'sglang'`). Need to either:
- Query `runtimeVariants` to get name-to-UUID mapping, or
- Use the `rowId` from the endpoint's `runtime_variant` in edit mode

### ENV vs ARGS Serialization
Backend presets define `targetSpec.presetTarget` as `ENV` or `ARGS`:
- `ENV`: Set as individual environment variable using `targetSpec.key` as the var name
- `ARGS`: Serialize into `{RUNTIME}_EXTRA_ARGS` env var as CLI flags using `targetSpec.key`

### Category Mapping
Backend provides categories like `model_loading`, `resource_memory`, `serving_performance` (9 total). Frontend currently uses `sampling`/`context`/`advanced` (3 total). The new implementation should render whatever categories the API returns, with `displayName` used as section headers.

### Removed Parameters
Per spec, these frontend-only parameters are removed (not in backend presets):
- Seed (`--seed`) - debugging/reproducibility
- Enforce Eager (`--enforce-eager`) - debugging only
- 7 sampling parameters (temperature, top_p, etc.) - request-time params, not server-start params
