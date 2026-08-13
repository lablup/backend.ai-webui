# Research: antd-era rich-trigger inventory + environment selector dependency surface

Resolves issue [#8763](https://github.com/lablup/backend.ai-webui/issues/8763)
(part of the #8761 wayfinder map; blocks #8764).

**Method.** Primary sources only:

- Git history of this repository. The last pre-migration (antd) revision of the
  environment selector is commit `7d365cac9` ("fix(FR-3462): resolve partial
  default image references before launching a session", PR #8574) — the commit
  immediately preceding the to-astryx migration `7d7b42388` ("feat(FR-3482):
  migrate the WebUI from Ant Design to Astryx", PR #8626) in the file's
  `git log --follow` history.
- Current source on `main` (worktree of `e40fd8f47`).
- Installed package types: `react/node_modules/@astryxdesign/core/dist/**` (Astryx v0.3.0).

Citations use `file:line`. Historical claims are cited as `SHA:file:line`
(verify with `git show SHA:file`).

---

## 1. What the antd-era environment/version selects rendered

Source: `7d365cac9:react/src/components/ImageEnvironmentSelectFormItems.tsx`
(885 lines), plus its supporting components at the same SHA.

### 1.1 Environment select — option markup

Both selects were `BAISelect` (then a thin wrapper over antd `Select`,
`7d365cac9:packages/backend.ai-ui/src/components/BAISelect.tsx:217`) using
antd's **children option API**: `Select.OptGroup` per metadata group,
`Select.Option` per environment, with a **rich ReactNode row as the option's
children** (`7d365cac9:...ImageEnvironmentSelectFormItems.tsx:496-593`):

```tsx
// 7d365cac9:react/src/components/ImageEnvironmentSelectFormItems.tsx:547-588
<Select.Option
  key={environmentGroup.environmentName}
  value={environmentGroup.environmentName}
  filterValue={environmentGroup.displayName + '\t' + extraFilterValues.join('\t')}
>
  <BAIFlex direction="row" justify="between">
    <BAIFlex direction="row" align="center" gap="xs">
      <ImageMetaIcon
        image={getImageFullName(firstImage) || ''}
        style={{ width: 15, height: 15 }}
      />
      <TextHighlighter keyword={environmentSearch}>
        {environmentGroup.displayName}
      </TextHighlighter>
    </BAIFlex>
    <BAIFlex
      direction="row"
      className={isDarkMode ? 'tag-wrap-dark' : 'tag-wrap-light'}
      style={{ marginLeft: token.marginXS, flexShrink: 1 }}
      gap="xs"
    >
      {environmentPrefixTag}
      {tagsFromMetaImageInfoLabel}
    </BAIFlex>
  </BAIFlex>
</Select.Option>
```

Row anatomy, left to right:

| Piece | Component | Source |
|---|---|---|
| Framework icon | `ImageMetaIcon` — a bare `<img src={getImageIcon(image)}>`, `1em` square by default, here forced to 15×15 px, `verticalAlign: middle` | `7d365cac9:react/src/components/ImageMetaIcon.tsx:8-26`; icon file comes from `resources/image_metadata.json` `imageInfo[key].icon` (e.g. `"icon": "pytorch.svg"`, `7d365cac9:resources/image_metadata.json:282`) |
| Environment name | `TextHighlighter` around `displayName` — search-term substrings wrapped in `<span class="text-high-lighter">` with `backgroundColor: token.colorWarningHover` | `7d365cac9:react/src/components/TextHighlighter.tsx:30-45`; displayName = `imageInfo[key].name`, e.g. **"PyTorch (NGC)"** (`7d365cac9:resources/image_metadata.json:277-278`) |
| Prefix tag (right side) | `<Tag color="purple">` around the registry-path prefix, shown only when the prefix is not one of `lablup`/`cloud`/`stable` — this is where a `testing` namespace prefix renders | `7d365cac9:...ImageEnvironmentSelectFormItems.tsx:508-522` |
| Metadata label tags (right side) | one `<Tag color={label.color}>` per `imageInfo[key].label` entry **without** a `category` field | `7d365cac9:...ImageEnvironmentSelectFormItems.tsx:524-546`; e.g. `ngc-pytorch` carries `{ "tag": "NVIDIA GPU Cloud", "color": "green" }` (`7d365cac9:resources/image_metadata.json:289-292`) — the **"NVIDIA GPU Cloud"** green tag of the screenshot reference |

Tag colors were antd `Tag` preset color names (`purple`, `green`, `blue`,
`cyan`) coming straight from `image_metadata.json` / hardcoded strings — never
hex values.

When the search text exactly matched a full image name, the option list
collapsed to a single option rendering icon + the full image name
(`7d365cac9:...ImageEnvironmentSelectFormItems.tsx:470-494`).

### 1.2 Version select — option markup

The version select added a **column header row above the option list** via
antd's `popupRender`
(`7d365cac9:...ImageEnvironmentSelectFormItems.tsx:645-662`):

```tsx
popupRender={(menu) => (
  <>
    <BAIFlex style={{ fontWeight: token.fontWeightStrong, paddingLeft: token.paddingSM }}>
      {t('session.launcher.Version')}
      <Divider type="vertical" />
      {t('session.launcher.Architecture')}
      <Divider type="vertical" />
      {t('session.launcher.Tags')}
    </BAIFlex>
    <Divider style={{ margin: '8px 0' }} />
    {menu}
  </>
)}
```

Each option row (the `26.03 | x86_64 | PyTorch 2.11 | Python 3.12 | GPU:CUDA13.2`
row of the screenshot reference) rendered, `|`-separated by vertical `Divider`s
(`7d365cac9:...ImageEnvironmentSelectFormItems.tsx:750-845`):

- **extended-image-info path** (lines 761–819): `image.version` text →
  `image.architecture` text → per `image.tags` entry either a `BAIDoubleTag`
  (key + value as two joined tags, `blue`, or `cyan` when customized) or a
  single `<Tag color="blue"|"cyan">` with the aliased tag text.
- **legacy path** (lines 820–843): `getBaseVersion(fullName)` →
  `image.architecture` → `<ImageTags tag={image.tag} labels={image.labels}>`.
- Requirement segments of the tag string (`-cuda13.2` etc.) became
  `BAIDoubleTag`s such as `GPU:CUDA13.2` (lines 694–715), and customized images
  appended a `Customized:<name>` cyan `BAIDoubleTag` (lines 716–749).

All version-row text was wrapped in `TextHighlighter keyword={versionSearch}`.

### 1.3 `ImageTags` / `BaseImageTags` (old sources)

`7d365cac9:react/src/components/ImageTags.tsx`:

- **`ImageTags`** (lines 88–135): maps `getTags(tag, labels)` to either a
  `BAIDoubleTag` (`[tagAlias(tag.key), tag.value]`, both `blue`, or `cyan` when
  `tag.key === 'Customized'`) or a plain `<Tag color="blue"|"cyan">` with the
  aliased text — used by the version select's legacy path.
- **`BaseImageTags`** (lines 45–56): `<Tag color="green">` around
  `tagAlias(getBaseImage(image))` — *not* used by the selects at this SHA; it
  belongs to `SessionKernelTags` (lines 74–86) alongside
  `ImageAliasNameAndBaseVersionTags` (blue name + green base-version
  `BAIDoubleTag`, lines 22–43) and `ArchitectureTags` (green, lines 58–72).
- **`BAIDoubleTag`** (`7d365cac9:packages/backend.ai-ui/src/components/BAIDoubleTag.tsx`):
  two antd `Tag`s visually joined by `{ margin: 0, marginRight: -1 }` on the
  first, each label ellipsized at `maxWidth: 150` with a tooltip.

### 1.4 How the selected value appeared in the antd trigger

**Neither select passed `labelRender` nor `optionLabelProp`** — `git grep
labelRender 7d365cac9 -- react/src/components/ImageEnvironmentSelectFormItems.tsx`
is empty. antd `Select`'s default therefore applied: **the selected option's
children ReactNode rendered verbatim inside the trigger's
`span.ant-select-selection-item`** — icon + highlighted name + tags for the
environment select; version | arch | tag row for the version select.

This is not inferred only from antd's documented default; the repo shipped CSS
that targets exactly that trigger markup:

1. The (later removed) co-located stylesheet
   `react/src/components/ImageEnvironmentSelectFormItems.css` — visible at
   `750f11f2f^` (`git show 750f11f2f^:react/src/components/ImageEnvironmentSelectFormItems.css`):

   ```css
   /* Change the image and tags of the select option when the selection is opened */
   div.image-environment-select-form-item div.ant-select-open
     span.ant-select-selection-item div img,
   div.image-environment-select-form-item div.ant-select-open
     span.ant-select-selection-item div span.ant-tag {
     opacity: 0.5;
   }
   div.image-environment-select-form-item span.ant-select-selection-item
     div.tag-wrap-light { overflow: hidden; }
   div.image-environment-select-form-item span.ant-select-selection-item
     div.tag-wrap-light::after {
     content: ''; position: absolute; top: 0; right: 0; bottom: 0;
     width: 10px; /* fade-out gradient over clipped tags */
     background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1));
   }
   /* (.tag-wrap-dark variants: same, with rgba(20,20,20,…)) */
   ```

   An `img` and `span.ant-tag` **inside `ant-select-selection-item`** only
   exist because the trigger renders the option's ReactNode children.

2. Commit `750f11f2f` ("style(FR-1795): fix value content style of Select when
   dropdown opens", PR #4866) deleted that file and generalized the treatment
   into `BAISelect` itself. The antd-era `BAISelect`'s `customStyle`
   (`7d365cac9:packages/backend.ai-ui/src/components/BAISelect.tsx:65-110`):

   - while the user is **typing a search query**, hide the rich value content
     (`.ant-select-content-has-search-value img / .ant-divider / .ant-badge /
     span.text-high-lighter / span.ant-tag { opacity: 0 }`), lines 69–76;
   - while the **dropdown is open**, dim the trigger's images / dividers /
     badges / tags to `opacity: 0.5`, lines 79–84, and fade secondary/status
     text to placeholder color, lines 87–92.

**Antd-era trigger visual spec, condensed:** the trigger shows the same rich
ReactNode as the option row (icon 15px + name left, colored tags right for the
environment select; `version | arch | tags` for the version select), one line
tall, right-side tags clipped by `overflow: hidden` with a 10px fade gradient,
the whole rich content dimmed to 50% while the dropdown is open and hidden
while a search string is typed.

---

## 2. Today's dependency surface vs `BAIComplexSelect` / Astryx `ComplexSelector`

Files:

- Consumer: `react/src/components/ImageEnvironmentSelectFormItems.tsx` (current `main`)
- Current wrapper: `packages/backend.ai-ui/src/components/BAISelect.tsx`
- Candidate: `packages/backend.ai-ui/src/components/BAIComplexSelect.tsx`
- Astryx shell: `react/node_modules/@astryxdesign/core/dist/ComplexSelector/ComplexSelector.d.ts`
- Astryx simple select: `react/node_modules/@astryxdesign/core/dist/Selector/Selector.d.ts`

**Key context discovered:** several props today's file still passes are
**accepted-and-inert** in the post-migration `BAISelect` — the consumer's
"reliance" is partly nominal. The table therefore records what the prop *does
today*, not just that it is passed.

| # | Consumer relies on (file:line) | Current `BAISelect` behavior | `BAIComplexSelect` / `ComplexSelector` | Verdict |
|---|---|---|---|---|
| 1 | Controlled `open` + `onOpenChange` — auto-opens the env dropdown on `searchPrefill` (`ImageEnvironmentSelectFormItems.tsx:434-441`, state at `:108-122`) | **Inert.** Destructured to `_open` / `_onOpenChange` and dropped (`BAISelect.tsx:164-165, 282-283`); Astryx `Selector` offers only `isDefaultOpen` (`Selector.d.ts:166-170`). The prefill auto-open is already a no-op on `main`. | `ComplexSelector` has **no** open-control prop (`ComplexSelector.d.ts:33-76`); open state is internal, exposed read-only as `state.isOpen` to the render prop (`d.ts:19-28, 43`). `BAIComplexSelect` **reports** open/close via `onOpenChange` (`BAIComplexSelect.tsx:177-181, 203-211, 406-409`) but cannot be told to open. | **Lacks** (controlled open); covers open *reporting*, which current `BAISelect` doesn't. |
| 2 | `showSearch={{ searchValue, onSearch, optionFilterProp: 'filterValue' }}` — controlled search feeding `TextHighlighter` + full-name match (`:442-446` env, `:682-686` version) | **Partially inert.** Only `hasSearch: showSearch !== false` survives (`BAISelect.tsx:506`); `searchValue` / `onSearch` are never forwarded — `Selector` has no search-control props, only `hasSearch` / `searchPlaceholder` (`Selector.d.ts:146-155`), so `environmentSearch` / `versionSearch` never update from typing on `main`. `optionFilterProp` / per-option `filterValue` are documented inert; filtering matches the visible label text (`BAISelect.tsx:146-153, 331-343, 602-608`; FR-3499). | `BAIComplexSelect` supports **controlled search**: `searchValue` + `onSearch` per keystroke (`BAIComplexSelect.tsx:143-146, 224-258, 410-432`). It does **no filtering itself** — the caller supplies `options`, so `filterValue`-style synthetic search keys are the caller's own filter logic, fully expressible. | **Covered differently — and more completely than today** (controlled search restored; custom filter keys become caller-side filtering). |
| 3 | `popupMatchSelectWidth={false}` (`:447` env, `:675` version) | **Inert** (`BAISelect.tsx:184-188, 272`). | The popup is an independent dialog-popover surface; nothing sizes it to the trigger. Sizing knob is `contentXstyle` on the content container (`ComplexSelector.d.ts:72-73`; content node at `ComplexSelector.js:218-221`). | **Covered differently** (popup width independent by construction; styled via `contentXstyle`). |
| 4 | `defaultActiveFirstOption` — Enter selects the first (filtered) option (`:448`) | **Inert** (`BAISelect.tsx:205, 281`). | `BAIComplexSelect` starts its roving highlight at index 0 (`useState(0)`, `BAIComplexSelect.tsx:255`; clamped `:262-266`) and Enter commits the highlighted option (`:347-351`) — equivalent outcome, but keyboard handling lives on the search `TextInput` (`:425`), so it requires `hasSearch`. `ComplexSelector` itself has no notion of options at all (render-prop shell). | **Covered** (by `BAIComplexSelect`, differently; search-input-scoped). |
| 5 | `Form.Item` value integration — form-engine injects `value`/`onChange` by `cloneElement` (`packages/backend.ai-ui/src/form-engine/FormItem.tsx:474`, `Field.tsx:516-527`); field stores a plain string (`environmentName` / full image name) | Works: `BAISelect` accepts injected `value`/`onChange` and emits **the caller's own option value** back (`BAISelect.tsx:445-455`). | `BAIComplexSelect` is controlled the same way, **but its value contract is antd `labelInValue`**: `{ label, value }` object or array (`BAIComplexSelect.tsx:104-110, 130-137`, header "VALUE CONTRACT" `:28-33`). A plain-string form field needs `getValueProps` / `normalize` on the `Form.Item` (supported: `Field.tsx:80, 516-527`) or an adapter. | **Covered differently** — value-shape mismatch (labelInValue object vs plain string) must be bridged. |
| 6 | `ref` + `.focus()` on prefill (`:105-107` type, `:124-133` effect) | **Inert.** `ref` accepted, never attached (`BAISelect.tsx:207-213`); the consumer's own comment records `.focus()` has been a no-op since wave 2 (P26-8) (`ImageEnvironmentSelectFormItems.tsx:100-104`). | No `ref` prop on `BAIComplexSelect` (`:130-192`); no imperative handle on `ComplexSelector` (`ComplexSelector.d.ts:33-76`). | **Lacks** — but at parity with today's actual (no-op) behavior. |
| 7 | `popupRender` — version select's column header row (`:687-704`) | **Inert** (`BAISelect.tsx:188, 273`); the header row does not render on `main`. | `BAIComplexSelect` has `header` / `footer` **ReactNode** slots rendered inside the popup above/below the listbox (`BAIComplexSelect.tsx:170-174, 434, 477`). | **Covered differently** (dedicated slots instead of a menu-wrapping hook). |
| 8 | Rich ReactNode option rows (icon + tags), via `BAISelectOptionItem` children (`:499-635, 792-891`) | Preserved: children flattened, JSX kept and re-rendered through `renderOption` (`BAISelect.tsx:289-362, 431-443`); but the **trigger** renders only the flattened text label (`FR-3499` note, `BAISelect.tsx:331-343`). | `BAIComplexSelect` P26-3: option `label` **must be a string**; rich content goes in `description` / `extra` slots (`BAIComplexSelect.tsx:119-128`, header `:52-56`). However the underlying `ComplexSelector` accepts **`triggerLabel?: ReactNode`** (`ComplexSelector.d.ts:44-45`) and hands the whole popup body to a render prop (`d.ts:42-43`) — a rich trigger *and* rich rows are expressible at the shell level, just not through `BAIComplexSelect`'s current option model. | **Covered differently / partially** — the restore's rich trigger needs `ComplexSelector.triggerLabel`, which `BAIComplexSelect` currently reduces to strings (`BAIComplexSelect.tsx:358-384`). |

Summary for the API decision (#8764): the only hard **gaps** are controlled
`open` (needed by the `searchPrefill` flow — though that flow is *already
broken* on `main` via inert props) and an imperative focus handle (already a
no-op). Everything else is covered, but through different mechanisms:
caller-side filtering, `header`/`footer` slots, labelInValue adaptation, and —
decisive for the trigger restore — `ComplexSelector`'s ReactNode `triggerLabel`
plus render-prop popup, which is precisely the affordance `Selector`-based
`BAISelect` cannot offer.

---

## 3. Other antd-era `labelRender` / ReactNode-label call sites (out-of-scope record)

`git grep -n "labelRender" 7d365cac9 -- 'react/src' 'packages'` (generated files
excluded):

- `packages/backend.ai-ui/src/components/fragments/BAIKeypairSelect.tsx:245` — trigger label rebuilt from `{label}`.
- `packages/backend.ai-ui/src/components/fragments/BAIObjectStorageSelect.tsx:100` — trigger label from `{label}` node.
- `packages/backend.ai-ui/src/components/fragments/BAIProjectVfolderSelect.tsx:252` — trigger from `{label, value}`.
- `packages/backend.ai-ui/src/components/fragments/BAIStorageHostSelect.tsx:252` — trigger from `{label}`.
- `packages/backend.ai-ui/src/components/fragments/BAIUserSelect.tsx:285` — identity `labelRender={({ label }) => label}`.
- `packages/backend.ai-ui/src/components/fragments/BAIVFolderSelect.tsx:291` — trigger from `{label, value}`.
- `react/src/components/SessionFormItems/ResourceAllocationFormItems.tsx:1430` — labelRender on a resource select.
- `react/src/pages/ModelStoreListPageV2.tsx:441` — labelRender wrapping the label in custom JSX.

(The environment selector itself is *not* in this list — its rich trigger came
from ReactNode option children, §1.4, not `labelRender`.)
