# Service Launcher Advanced Mode Dev Plan

## Spec Reference
`.specs/FR-2444-service-launcher-advanced-mode/spec.md`

## Epic: FR-2444

## Sub-tasks (Implementation Order)

### 1. Add Advanced collapsible Card with toggle, URL sync, and move env vars / cluster mode — #6368
- **Changed files**:
  - `react/src/components/ServiceLauncherPageContent.tsx` — add Advanced Card, move EnvVarFormList and cluster mode/size JSX, add `advancedMode` URL query param
  - `react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx` — add `hideClusterMode` prop to conditionally suppress cluster mode/size rendering
- **Dependencies**: None
- **Review complexity**: Medium
- **Description**: Create an Advanced collapsible Card following the `SessionOwnerSetterCard` pattern (Card + Switch toggle + `styles.body.display` visibility). Move environment variables (`EnvVarFormList`) and cluster mode/size from their current locations into this Card. Add `advancedMode` boolean to `useQueryParams` for URL persistence. Change cluster mode tooltip icons from `InfoCircleOutlined` to `QuestionCircleOutlined`. Ensure form validation spans both default and Advanced sections.

### 2. Replace VFolderTableFormItem with BAIVFolderSelect multi-select — #6369
- **Changed files**:
  - `react/src/components/ServiceLauncherPageContent.tsx` — replace `VFolderTableFormItem` with `BAIVFolderSelect` in `mode="multiple"`, update form value mapping
- **Dependencies**: Sub-task 1 (#6368 blocks #6369)
- **Review complexity**: Medium
- **Description**: Replace the table-based additional mount selector (`VFolderTableFormItem`) with `BAIVFolderSelect` using `mode="multiple"` inside the Advanced Card. Apply the same filter conditions (exclude model folder, only ready status, exclude model usage mode, exclude system folders). Ensure `mount_ids` form field and `extra_mounts` payload format remain compatible with both create and edit flows.

## PR Stack Strategy
- Sequential: #6368 -> #6369

## Dependency Graph
```
#6368 (Advanced Card + toggle + env vars + cluster mode)
  |
  └──blocks──→ #6369 (BAIVFolderSelect multi-select replacement)
```
