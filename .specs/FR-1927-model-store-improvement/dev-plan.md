# Model Store List UI Redesign Dev Plan

## Spec Reference
`.specs/FR-1927-model-store-improvement/spec.md` — Section 2: Model Item List UI Redesign

## Epic: FR-1927

## Scope

This dev plan covers ONLY section 2 of the spec:
1. Replace thumbnail card UI with HuggingFace-like list layout (icon + model name + tags)
2. Brand icons from `@lobehub/icons` npm package (lazy-loaded components)
3. Tags from model definition metadata (framework, task, etc.)

> **Out of scope**: Pagination (#6252) — backend query will change, handled separately.

## Sub-tasks (Implementation Order)

### 1. Add model brand icon mapping utility — [#6250](https://github.com/lablup/backend.ai-webui/issues/6250)
- **Changed files**: `react/src/helper/modelBrandIcons.ts` (new), `react/src/components/ModelBrandIcon.tsx` (new)
- **Dependencies**: None
- **Review complexity**: Low
- **Description**: Create a utility that maps model name keywords to brand icon URLs from icons.lobehub.com. Mapping rules: GPT/OpenAI -> OpenAI icon, Llama -> Meta icon, Gemma -> Google icon, Mistral -> Mistral icon, etc. Includes a `ModelBrandIcon` React component with fallback for unmapped models. This is a self-contained module with no existing code dependencies.

### 2. Redesign Model Store list from card grid to list layout — [#6251](https://github.com/lablup/backend.ai-webui/issues/6251)
- **Changed files**: `react/src/pages/ModelStoreListPage.tsx`
- **Dependencies**: Sub-task 1 (#6250 blocks #6251)
- **Review complexity**: Medium
- **Description**: Refactor `ModelStoreListPage.tsx` card contents to match HuggingFace model list style. Replace `List` with `Row`/`Col` for reliable responsive grid:
    - Remove `Image` thumbnail, description, `List` component, and `useStyles`/`createStyles`
    - Card line 1: `ModelBrandIcon` (from sub-task 1) + model name
    - Card line 2: task + category + label tags
    - Responsive grid: `<Row gutter={[16, 16]}>` + `<Col xs={24} sm={24} md={12}>` (2 columns on md+, 1 column on sm/xs)
    - Keep existing search input, category/task/label filter selects, and `ModelCardModal` integration unchanged

## PR Stack Strategy
- Sequential stack: 1 -> 2
- Branch pattern: `feature/model-store-list-redesign-*`

## Dependency Graph
```
#6250 (brand icon utility) ──blocks──> #6251 (list layout redesign)
```

## Key Implementation Notes

### Current State (to be changed)
- `ModelStoreListPage.tsx` uses `List` with `grid={{ gutter: 16, column: 2 }}` rendering `Card` components with `Image` thumbnails
- `useModelCardMetadata` fetches `resources/model_card_metadata.json` for thumbnail URLs and sorting — thumbnail part no longer needed after redesign, but sorting is still used
### Patterns to Follow
- Relay query refetch: existing `fetchKey` + `useUpdatableState` pattern already in `ModelStoreListPage.tsx`
- i18n: existing keys under `modelStore` namespace in `resources/i18n/en.json`

### External Dependency
- Brand icons from `@lobehub/icons` npm package (lazy-loaded per brand, no CDN dependency)
