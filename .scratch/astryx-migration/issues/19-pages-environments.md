# 19 — 페이지군 ⑤ Environments/이미지

**Target:** to-astryx
**Blocked by:** 09, 10, 11, 12, 13, 14
**Status:** done

**Principles:** MIGRATION-SPEC §0 정책 준수 — 래퍼(Astryx 직사용)·시각값(기본값, 변경은 theme)·**단순성(antd 동등성 강박 금지: 외관·기능 모두 — 복잡해지면 드롭+PILOT-DECISION)**·원본 레이아웃 충실도·번역 프런티어. 시작 전 `assets/antd-astryx-mapping/`의 SKILL.md+MAPPING.md 로드, ASTRYX 블록의 discover-don't-guess 워크플로(`astryx build/template/component`) 사용. MCP search 단독 신뢰 금지.

**What to build:** 해당 메뉴 영역의 페이지·컴포넌트를 MAPPING.md(DIRECT+PROP-CONDITIONAL)로 전환. 원본 레이아웃 충실도 유지, 공유 컴포넌트는 프런티어 번역, 갭 컴포넌트(08) 사용. 복잡해지는 antd 기능은 단순성 정책대로 드롭+기록.

## Acceptance criteria

- [x] 영역 내 antd 컴포넌트 렌더 0(Form 계열·프런티어 제외) — P15 리졸버로 증명
- [x] 페이지별 before/after 스크린샷(라이트/다크) 시각 게이트 통과
- [x] PILOT-DECISION/드롭 목록 기록
- [x] verify.sh ALL PASS

## Implementation notes

### Area (router-derived scope)

- `/environment` → `EnvironmentPage` (tabs: image / preset / registry) —
  `ImageList`, `ResourcePresetList`, `ContainerRegistryList`
- `/my-environment` → `MyEnvironmentPage` — `CustomizedImageList`
- ModelStore is routed under the AI area → EXCLUDED (ticket 23).
- ResourcePresets IS routed here (preset tab) → included.
- Modals: `ImageInstallModal`, `ManageAppsModal`,
  `ManageImageResourceLimitModal`, `ContainerRegistryEditorModal`,
  `ResourcePresetSettingModal`, shared `TableColumnsSettingModal`.
- Tag displays: `AliasedImageDoubleTags`, `ImageTags` (BaseImageTags /
  ArchitectureTags / ImageAliasNameAndBaseVersionTags / SessionKernelTags),
  BUI `BAIDoubleTag` (frontier-translated internally).

### Conversions (ticket-15 idioms followed)

- BAICard tabList → Astryx `Card padding={6}` + `VStack gap={4}` +
  `TabList hasDivider` (+ `Tab`) on both pages; Skeleton/FlexActivityIndicator
  suspense fallbacks → `BAISkeletonAstryx rows={4}`.
- Tooltip+Button refresh / icon-only text Buttons / pagination `extraContent`
  settings buttons → `IconButton` (labels from existing i18n keys:
  `button.Refresh`, `table.SettingTable`, `button.Delete`,
  `environment.ManageApps`, `environment.ModifyMinimumImageResourceLimit`).
- Primary CTAs (`InstallImage`, `AddRegistry`, `CreatePreset`) →
  `Button variant="primary"` (brand accent from theme, not inline style).
- `Tag` → `Badge` via `badgeVariantForTagColor` ONLY (ticket-13 lookup):
  gold→yellow (Installed/Installing), cyan (customized), blue (image tags),
  uncolored project tag → neutral. BUI `BAIDoubleTag` converted internally,
  antd-shaped `color?: string` props kept (frontier translation).
- `Typography.Text copyable` → `BAICopyableText` (astryx-bui);
  `ellipsis={{tooltip}} + maxWidth` → `Text maxLines={1}` in a BAIFlex
  width wrapper; `strong` → `weight="semibold"`.
- antd `Switch` → Astryx `Switch` (`value`/`isLoading`/`isDisabled`,
  `label isLabelHidden`) in ContainerRegistryList.
- antd `Input` search (CustomizedImageList) → `TextInput`
  (`startIcon={Search}`, `hasClear`, hidden label) with an urgent input-value
  mirror state (a controlled Astryx input cannot be fed transition state).
- antd `List` + built-in pagination (ImageInstallModal) → Astryx
  `List`/`ListItem` + standalone `Pagination variant="count"` (local page
  state, page size 5 as before).
- antd `Alert type="info"` → `Banner status="info"` (showIcon dropped —
  Banner default); margins → BAIFlex column gaps.
- `Row gutter`/`Col span={12}` (ManageImageResourceLimitModal) →
  `Grid columns={2} columnGap={6} rowGap={4} align="start"` (fixed 2-up, no
  breakpoint props involved).
- Static `message` import → `App.useApp()` app-shim (ManageAppsModal,
  ManageImageResourceLimitModal).
- Direct antd type imports (`ColumnsType`/`ColumnType`/`TableColumnsType`/
  `AnyObject`) → BUI `BAIColumnsType`/`BAIColumnType`.
- `BAISelectionLabel` import switched from BUI to the astryx-bui gap
  component (ImageList).

### Forms (engine stays; visuals via BAIFormItem)

- New `react/src/components/astryxFormControls.tsx` — adapters ported from
  the pilot + extended: `AstryxFormTextInput` (adds `type` password,
  `startIcon`, `allowClear`), `AstryxFormNumberInput` (antd `suffix` →
  `units`; string-ish values coalesced), `AstryxFormCheckbox`
  (`onValueChange` escape hatch, valuePropName="checked" dropped),
  `AstryxFormSelector` (hasClear discriminated-union branch).
- All visual `Form.Item`s in the five form modals swapped to `BAIFormItem`
  (drop-in; noStyle passthrough kept for state-only items). Render-prop
  children re-typed to `(form) => …` with `FormInstance` casts (BAIFormItem's
  children signature is `(form: unknown) => ReactNode`).
- `TableColumnsSettingModal`: `Checkbox.Group` (per-option `display:none`
  filtering) → thin controlled `ColumnKeysChecklist` of Astryx
  `CheckboxInput`s in a `VStack`; hidden-but-checked state preserved by
  filtering the render, not the value.

### PILOT-DECISION / drop list

1. Icon tint drops (P5/P11): control-column icons lose `token.colorInfo`
   blue; `type="text" danger` delete buttons lose the red tint — ghost
   `IconButton` (a solid `destructive` per row would be louder than the
   original; IconButton has no ghost-destructive).
2. Hand-painted primary Install button (`style backgroundColor
   token.colorPrimary`) → `Button variant="primary"` (theme accent).
3. `type="dashed"` Add button (ManageAppsModal) → `variant="secondary"`
   (MAPPING §3.3: no dashed equivalent); `block` → `width="100%"`; the
   first-row `marginTop: 8` antd-label nudge dropped.
4. `Input.Password` visibility-toggle eye → dropped (TextInput
   type="password" has no toggle; simplicity policy).
5. `InputNumber stringMode` (ResourcePresetSettingModal) → dropped
   (NumberInput has no big-number mode; slot counts are inside float
   precision).
6. BAIDoubleTag weld (margin −1px joined pair) → two adjacent Badges
   (HStack gap 0.5); per-segment 150px ellipsis+tooltip dropped (Text is not
   width-cappable inside Badge without xstyle).
7. antd List `showTotal` ("Total N items") → `Pagination variant="count"`
   phrasing (x–y of N).
8. `Alert showIcon` → dropped (Banner shows its icon by default).
9. MyEnvironmentPage suspense fallback FlexActivityIndicator (antd Spin) →
   BAISkeletonAstryx (loading idiom parity with ticket 15).
10. `TagProps` type-only import kept in ImageTags.tsx (frontier: public prop
    surfaces stay antd-shaped for unmigrated consumers; extra TagProps beyond
    `color` are ignored by the Badge render).

### Gates / evidence

- P15 resolver: direct antd 502 → **494** (−8: EnvironmentPage, ImageList,
  CustomizedImageList, ContainerRegistryList, ResourcePresetList,
  ImageInstallModal, AliasedImageDoubleTags, BUI BAIDoubleTag).
  Remaining direct-antd files in the area are exactly the documented
  exceptions: Form/FormInstance (SHIM) in the five form modals + the
  type-only `TagProps` frontier import. BAITable/BAIModal/BAIPropertyFilter/
  BAIDeleteConfirmModal/BAIText/BAINameActionCell/BAIDynamicUnitInputNumber/
  BAISelect etc. remain BUI frontier (tickets 25–30).
- `.ant-*` grep over converted files: 0 (P6); no new `var()` fallbacks (P19);
  no `data-testid` re-anchoring in area files (P7).
- Shots: `.scratch/astryx-migration/shots/19/{before,after}-{images,presets,
  registries,customized,preset-modal,registry-modal}-{light,dark}.png` via
  `react/theme-probe/environments.html` (+ `environments.tsx` stub client,
  `environmentsMain.tsx` relay-test-utils mount — ticket-15 pattern, port
  5655). Modal cases click "Create Preset" / "Add Registry" so the
  BAIFormItem + Astryx form-control surface is captured.
- `bash scripts/verify.sh`: **=== ALL PASS ===**
