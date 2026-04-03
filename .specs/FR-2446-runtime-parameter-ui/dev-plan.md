# Dev Plan: Runtime Parameter Configuration UI (FR-2446)

> **Epic**: FR-2446 | **Spec**: [spec.md](./spec.md) | **Parent Issue**: #6350

## Implementation Waves

### Wave 1 (Independent - Parallel)

| Sub-task | Issue | Branch | Description |
|----------|-------|--------|-------------|
| PR 1: Parser Utility | [#6370](https://github.com/lablup/backend.ai-webui/issues/6370) | `feat/fr-2446-runtime-extra-args-parser` | CLI arg string parsing/serialization/merge utility + unit tests |
| PR 2: Fallback Metadata | [#6371](https://github.com/lablup/backend.ai-webui/issues/6371) | `feat/fr-2446-runtime-parameter-fallbacks` | Hardcoded vLLM/SGLang parameter metadata constants |

### Wave 2 (Depends on Wave 1)

| Sub-task | Issue | Branch | Description |
|----------|-------|--------|-------------|
| PR 3: Schema Hook + Form Component | [#6372](https://github.com/lablup/backend.ai-webui/issues/6372) | `feat/fr-2446-runtime-parameter-form` | GraphQL schema fetch hook + dynamic form rendering component |

### Wave 3 (Depends on Wave 2)

| Sub-task | Issue | Branch | Description |
|----------|-------|--------|-------------|
| PR 4: Service Launcher Integration | [#6373](https://github.com/lablup/backend.ai-webui/issues/6373) | `feat/fr-2446-runtime-parameter-integration` | Wire up form to service launcher, env var conversion, edit mode reverse-mapping, i18n |

## Dependency Graph

```
#6370 (Parser) ──┐
                 ├──> #6372 (Hook + Component) ──> #6373 (Integration)
#6371 (Fallback) ┘
```

## Stacked PR Order (bottom → top)

```
main
 └─ PR 1: #6370 — runtime extra args parser utility
     └─ PR 2: #6371 — runtime parameter fallback metadata
         └─ PR 3: #6372 — runtime parameter schema hook and form component
             └─ PR 4: #6373 — integrate runtime parameter UI into service launcher
```

## Key Files

### New Files
- `react/src/helper/runtimeExtraArgsParser.ts` — parsing/serialization/merge
- `react/src/helper/runtimeExtraArgsParser.test.ts` — unit tests
- `react/src/constants/runtimeParameterFallbacks.ts` — fallback metadata
- `react/src/hooks/useRuntimeParameterSchema.ts` — schema fetch + merge hook
- `react/src/components/RuntimeParameterFormSection.tsx` — dynamic form component

### Modified Files
- `react/src/components/ServiceLauncherPageContent.tsx` — integration point
- `react/src/hooks/useVariantConfigs.ts` — EXTRA_ARGS description update
- `resources/i18n/` — i18n keys for parameter labels/categories

### Reused Existing Code
- `react/src/helper/parseCliCommand.ts` — `tokenizeShellCommand()`
- `react/src/components/InputNumberWithSlider.tsx` — slider + number input combo
