# Auto Scaling Rule UX Improvements Dev Plan

## Spec Reference
`.specs/draft-auto-scaling-rule-ux/spec.md`

## Sub-tasks (Implementation Order)

### 1. Rename existing editor modal to Legacy + extract Legacy rule list from EndpointDetailPage

Rename the existing Graphene-based `AutoScalingRuleEditorModal.tsx` to `AutoScalingRuleEditorModalLegacy.tsx` and extract the auto-scaling rules table (lines 765-996 of `EndpointDetailPage.tsx`) into a new `AutoScalingRuleListLegacy.tsx` component. Apply comparator display normalization in the Legacy list (flip `GREATER_THAN` to show `[threshold] < [metric]`). Limit the comparator dropdown in the Legacy editor to only `LESS_THAN` and `GREATER_THAN`. Add version-gating support key `prometheus-auto-scaling-rule` for `>=26.4.0` in `backend.ai-client-esm.ts`. Update `EndpointDetailPage.tsx` to conditionally render Legacy components when `<26.4.0`.

- **Changed files**:
  - `react/src/components/AutoScalingRuleEditorModal.tsx` -> renamed to `react/src/components/AutoScalingRuleEditorModalLegacy.tsx`
  - `react/src/components/AutoScalingRuleListLegacy.tsx` (new, extracted from EndpointDetailPage)
  - `react/src/pages/EndpointDetailPage.tsx` (remove inline table, import Legacy components conditionally)
  - `src/lib/backend.ai-client-esm.ts` (add `prometheus-auto-scaling-rule` feature key for `>=26.4.0`)
- **Dependencies**: None
- **Review complexity**: Medium (file restructuring, mostly moving existing code)

### 2. Create new Strawberry AutoScalingRuleList component

Build `AutoScalingRuleList.tsx` for `>=26.4.0` that queries `ModelDeployment.autoScalingRules` nested connection (Strawberry API). Display conditions using `minThreshold`/`maxThreshold` with normalized `<` direction. Show Prometheus preset name for `PROMETHEUS` metric source rules (load presets via `prometheusQueryPresets` query and match by `prometheusQueryPresetId` using `toLocalId`). Wire up delete mutation (`deleteAutoScalingRule`). Update `EndpointDetailPage.tsx` to render the new list when `>=26.4.0`.

- **Changed files**:
  - `react/src/components/AutoScalingRuleList.tsx` (new)
  - `react/src/pages/EndpointDetailPage.tsx` (add conditional import for new list, adjust query for Strawberry path)
  - `resources/i18n/en.json` (add i18n keys: `TimeWindow`, `Range`, `Single`, `Upper`, `Lower`, `PrometheusPreset`, etc.)
- **Dependencies**: Sub-task 1 (version gating and Legacy extraction must exist first)
- **Review complexity**: High (new Relay queries against Strawberry schema, threshold display logic, preset matching)

### 3. Create new Strawberry AutoScalingRuleEditorModal with single/range mode and Prometheus preset

Build `AutoScalingRuleEditorModal.tsx` for `>=26.4.0` with:
- Segmented component for "Single" / "Range" condition mode toggle
- Single mode: direction selector (upper=`maxThreshold` only, lower=`minThreshold` only)
- Range mode: `minThreshold` + `maxThreshold` inputs with validation (min >= max = error)
- Metric source dropdown including `PROMETHEUS` option
- When `PROMETHEUS` selected: show Prometheus Query Preset Select (loaded via `prometheusQueryPresets`), auto-fill `metricName` from preset, show `queryTemplate` read-only, auto-apply `timeWindow`
- When `KERNEL`/`INFERENCE_FRAMEWORK` selected: hide preset UI, show AutoComplete for metric name
- `prometheusQueryPresetId` stored as raw UUID via `toLocalId(globalId)`
- Strawberry mutations: `createAutoScalingRule`, `updateAutoScalingRule`
- Wire into `EndpointDetailPage.tsx` for `>=26.4.0` path

- **Changed files**:
  - `react/src/components/AutoScalingRuleEditorModal.tsx` (new, Strawberry version)
  - `react/src/pages/EndpointDetailPage.tsx` (conditional import for new editor modal)
  - `resources/i18n/en.json` (add i18n keys for range mode, Prometheus preset UI)
- **Dependencies**: Sub-task 1 (version gating), Sub-task 2 (list component to display created/edited rules)
- **Review complexity**: High (new form logic with mode switching, Prometheus preset integration, Relay mutations)

### 4. (Nice to Have) Add Prometheus query result preview in editor modal

In the Strawberry editor modal (`>=26.4.0`), add a metric preview in the form item `extra` area when a Prometheus preset is selected. Call `prometheusQueryPresetResult` as an instant query (no `timeRange`). Display loading spinner, result value, and a refresh button. Pass `options` with `groupLabels: []` (required). Pass `filterLabels` from preset's `options.filterLabels` definition.

- **Changed files**:
  - `react/src/components/AutoScalingRuleEditorModal.tsx` (add preview section)
  - `resources/i18n/en.json` (add i18n keys for preview UI)
- **Dependencies**: Sub-task 3 (Prometheus preset selection must exist)
- **Review complexity**: Medium (single API call with display, straightforward)

## PR Stack Strategy
- Sequential: 1 -> 2 -> 3 -> 4
- Sub-tasks 2 and 3 both depend on 1 but could theoretically be parallel; however, Sub-task 3 (editor modal) benefits from Sub-task 2 (list) being in place to test the full create/edit flow, so sequential is preferred.

## Dependency Graph
```
Sub-task 1 (Legacy extraction + version gating)
    |
    +---> Sub-task 2 (Strawberry list)
              |
              +---> Sub-task 3 (Strawberry editor modal)
                        |
                        +---> Sub-task 4 (Prometheus preview, Nice to Have)
```

## Execution Waves

### Wave 1
- Sub-task 1: Legacy rename + extraction + version gating

### Wave 2
- Sub-task 2: Strawberry rule list

### Wave 3
- Sub-task 3: Strawberry editor modal with single/range + Prometheus preset

### Wave 4 (optional)
- Sub-task 4: Prometheus query result preview
