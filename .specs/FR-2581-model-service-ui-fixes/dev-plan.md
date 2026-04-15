# Model Service UI Fixes Dev Plan

## Spec Reference
`.specs/FR-2581-model-service-ui-fixes/spec.md`

## Sub-tasks (Implementation Order)

### 1. Change health check initial delay default from 5s to 60s - #6716
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx`, `react/src/helper/generateModelDefinitionYaml.ts`
- **Dependencies**: None
- **Review complexity**: Low
- **Description**: Replace `5.0` with `60` in three locations: the form initial value (`commandInitialDelay: 5.0` at line ~1206), the create mutation fallback (`values.commandInitialDelay ?? 5.0` at line ~657), and the YAML generator fallback (`input.initialDelay ?? 5.0` at line ~81). Pure value changes, no logic involved.

### 2. Display runtime variant in endpoint list and detail page - #6717
- **Changed files**: `react/src/components/EndpointList.tsx`, `react/src/pages/EndpointDetailPage.tsx`, `resources/i18n/en.json` (i18n key if needed)
- **Dependencies**: None
- **Review complexity**: Medium
- **Description**: Add `runtime_variant @since(version: "24.03.5") { human_readable_name }` to the `EndpointListFragment` GraphQL fragment. Add a table column in EndpointList. Add a description item in EndpointDetailPage (query already fetches the field but never renders it). Run `pnpm run relay` to regenerate artifacts.

### 3. Show model definition fields in custom runtime edit mode - #6718
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx`
- **Dependencies**: Sub-task 1 (#6716 blocks #6718)
- **Review complexity**: High
- **Description**: Refactor the edit mode branch in ServiceLauncherPageContent to show the full Segmented UI ("Enter Command" / "Use Config File") instead of the minimal `modelMountDestination` + `modelDefinitionPath` fields. Load existing model-definition.yaml from the vfolder and reverse-map values into form fields. On save in command mode, generate and upload updated YAML before calling `modify_endpoint`. Keep `modelMountDestination` disabled in edit mode. vLLM/SGLang runtimes unchanged.

## PR Stack Strategy
- Parallel: [1, 2] (independent, different files)
- Sequential: 1 -> 3 (Sub-task 3 depends on Sub-task 1 for correct default values)

## Dependency Graph
```
#6716 (initial delay default) ──blocks──> #6718 (model definition edit mode)
#6717 (runtime variant display)           (independent, parallel)
```

## Wave Execution Plan

### Wave 1 (parallel)
- #6716: Change initial delay default (Low complexity, ~3 line changes)
- #6717: Display runtime variant (Medium complexity, ~30-50 line changes)

### Wave 2 (after Wave 1)
- #6718: Model definition edit mode (High complexity, ~100-200 line changes)
