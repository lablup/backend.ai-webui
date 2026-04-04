# Paste Your Command Dev Plan

## Spec Reference
`.specs/paste-your-command/spec.md`

## Epic: FR-2438

## Sub-tasks (Implementation Order)

### 1. CLI Command Parser Utility - FR-2440
- **Changed files**: `react/src/helper/parseCliCommand.ts` (NEW), `react/src/helper/parseCliCommand.test.ts` (NEW)
- **Dependencies**: None
- **Review complexity**: High
- **Description**: Pure TypeScript utility for parsing CLI commands. Extracts runtime type (vllm/sglang/tgi), port (`--port N`), GPU hint (`--tp N`), docker env vars (`-e KEY=VALUE`), docker ports (`-p HOST:CONTAINER`). Includes shell-aware tokenizer for generating `start_command` arrays. All client-side, no external API calls. Unit tests cover all spec parsing examples.

### 2. UI: Segmented Control + Form Fields - FR-2441
- **Changed files**: `react/src/components/ServiceLauncherPageContent.tsx`, `resources/i18n/en.json`, `resources/i18n/ko.json`
- **Dependencies**: Sub-task 1 (FR-2440 blocks FR-2441)
- **Review complexity**: Medium
- **Description**: Add Ant Design Segmented component to Model Definition area when CUSTOM variant is selected. "Enter Command" (default) shows Start Command textarea + Port/Health Check/Model Mount fields with auto-fill from parser (debounced). "Use Config File" shows existing UI unchanged. GPU hint displayed near resource section. Only visible in create mode (not edit). Docker env vars auto-added to envvars form list.

### 3. YAML Generation + vFolder Upload + Service Creation Integration - FR-2442
- **Changed files**: `react/src/helper/generateModelDefinitionYaml.ts` (NEW), `react/src/components/ServiceLauncherPageContent.tsx`
- **Dependencies**: Sub-task 1 (FR-2440 blocks FR-2442), Sub-task 2 (FR-2441 blocks FR-2442)
- **Review complexity**: High
- **Description**: On [Create Service] click in "Enter Command" mode: generate model-definition.yaml from form values, check vfolder for existing file (confirm overwrite), upload via tus, then call POST /services. Upload failure aborts service creation. `model_definition_path` auto-set to `"model-definition.yaml"`, `runtime_variant` always `"custom"`.

## PR Stack Strategy
- Sequential: FR-2440 -> FR-2441 -> FR-2442 (each builds on the previous)
- Branch pattern: `feature/paste-your-command-{subtask-slug}`
  - `feature/paste-your-command-cli-parser`
  - `feature/paste-your-command-ui-segmented`
  - `feature/paste-your-command-yaml-upload`

## Dependency Graph
```
FR-2440 (CLI Parser)
   |
   +--blocks--> FR-2441 (UI: Segmented + Form Fields)
   |                |
   +--blocks--------+--blocks--> FR-2442 (YAML Gen + Upload + Integration)
```

## Implementation Notes

### Key Design Decisions from Spec
- **D1**: API `runtime_variant` is always `"custom"` even if vLLM detected (only CUSTOM reads `start_command` from yaml)
- **D2**: CLI flags stay in `start_command`, no env var mapping (except explicit `docker -e`)
- **D3**: yaml upload + service creation in 1 step (no separate "Apply" button)
- **D5**: Minimal parsing only (`--port`, `--tp`, runtime detection from first token)
- **D6**: Detected runtime name NOT shown in UI (internal hint only)
- **D7**: Create mode only (not edit mode)

### Existing Code Integration Points
- `ServiceLauncherPageContent.tsx` lines 1041-1088: current CUSTOM variant UI (replace with Segmented)
- `ServiceLauncherPageContent.tsx` lines 400-486: `mutationToCreateService` (insert yaml upload before POST)
- `baiClient.vfolder.list_files('.',vfolderId)`: check existing yaml
- `baiClient.vfolder.create_upload_session()`: tus upload for yaml file
- `EnvVarFormList`: receives docker-extracted env vars via `form.setFieldValue('envvars', ...)`

### yaml Schema Target
```yaml
models:
  - name: "model-name"
    model_path: "/models"
    service:
      start_command:
        - vllm
        - serve
        - /models/my-model
        - --tensor-parallel-size
        - "2"
      port: 8000
      health_check:
        path: /health
        initial_delay: 5.0
        max_retries: 10
```

### Risks
- **tus upload for small files**: Existing code in `VFolderTextFileEditorModal.tsx` shows a workaround for 0-byte files with tus; yaml files will be small but non-zero, so standard tus flow should work. Verify during implementation.
- **js-yaml dependency**: May need to add `js-yaml` package, or use manual string construction to avoid new dependency. Evaluate during FR-2442.
