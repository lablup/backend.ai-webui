/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAISelect` on Astryx (to-astryx phase 3, wave 2 / ticket W2-D).

 FRONTIER COMPONENT, and the widest one in this slice: 64 call sites in 56
 files, plus **12 components that declare `interface XProps extends
 BAISelectProps`** and spread the bag straight through — `StorageSelect`,
 `AccessKeySelect`, `ProjectSelect`, `PrometheusCategorySelect`,
 `Chat/ModelSelect`, `SettingItem`, `SharedResourceGroupSelectForCurrentProject`,
 `BAIProjectResourceGroupSelect`, `BAIProjectResourcePolicySelect`,
 `BAIResourceGroupSelect`, `BAIStorageProxySelect`, `BAIVFolderPathPicker`.
 None of those are in this ticket's scope, so the public prop surface stays
 antd `Select`-SHAPED and translates internally. `SelectProps` /
 `BaseOptionType` / `DefaultOptionType` / `GetRef` are replaced by locally
 declared equivalents so the module — a 574-file taint hub — drops out of the
 antd import graph (P15).

 Internals, per MAPPING §3.1:

   `mode="multiple"`  -> `MultiSelector` (`value: string[]`, required)
   everything else    -> `Selector`
   `showSearch`       -> `hasSearch` (+ the `searchAction` transition below)
   `allowClear`       -> `hasClear`
   `loading`          -> `isLoading`
   `disabled`         -> `isDisabled`
   `optionRender`     -> `renderOption`
   `status="error"`   -> `status={{ type: 'error' }}`
   `style.width`      -> `width`

 PILOT-DECISION — **ReactNode option labels survive via `renderOption`.**
 Astryx's `SelectorOptionData.label` is a plain `string`, but real call sites
 pass JSX (`StorageSelect`'s usage badge + `TextHighlighter`,
 `BAIVFolderPathPicker`'s path rows). Casting the node `as string` compiles and
 renders `[object Object]` into `aria-label` (P2). So each option is SPLIT: the
 flattened text becomes `label` (the accessible name and the search key) and
 the original node is looked up by value in `renderOption`. `optionRender` from
 the call site still wins when present.

 PILOT-DECISION — **the popup `header` / `footer` slots are rebuilt on
 `Selector`'s option model, not on a `popupRender` hook.** Astryx has no
 arbitrary popup-body escape hatch. A string `header`/`footer` becomes a
 `{type: 'section', title}` / a trailing divider + disabled option — both
 native, both keyboard-correct. A **node** header/footer has nowhere to land
 and is dropped: three call sites pass one, all of them the model-name hint in
 `Chat/ModelSelect`, which is a plain string and therefore unaffected.

 PILOT-DECISION — **`mode="tags"` routes to `MultiSelector`, losing free
 entry.** MAPPING §3.1 sends antd's tags mode to `Tokenizer`, whose whole point
 is entering values that are not in the option list. `BAISelect` has ONE live
 `tags` call site — `BAIProjectSettingModal`'s "Allowed Resource Groups", whose
 options are the server's resource-group list, so a hand-typed name was never a
 valid selection there in the first place. Routing it to `MultiSelector` keeps
 multi-select, keeps `allowClear`, and drops an affordance that could only
 produce an invalid value. The genuine free-entry sites already moved to the
 shared `Tokenizer` adapter in wave 1 (`AstryxFormTagsInput`, P3C-7).

 PILOT-DECISION — **`searchAction` is accepted and inert.** It ran a
 caller-supplied async search in a transition and surfaced it as `loading`.
 Astryx's `Selector` filters its own options client-side and exposes no
 `onSearch` at all — server-driven search is `Typeahead` / `ComplexSelector`
 territory by design (MAPPING §3.1). Measured live usage: ONE call site
 (`LegacyCreatePermissionModal`, over a static in-memory option list where
 client-side filtering is equivalent) plus a story. The prop stays in the
 signature so the 12 extenders keep compiling.

 PILOT-DECISION — **`endReached` / `atBottomStateChange` / `bottomLoading` are
 accepted and inert.** They implemented cursor pagination by watching
 `onPopupScroll`; Astryx `Selector` owns its popup and emits no scroll event
 (MAPPING §3.1 is explicit that a scroll-driven source is a `ComplexSelector`
 rebuild, not a `Selector` prop). Every paginated consumer already moved to
 `BAIComplexSelect` in wave 1 (ticket p3-c retired all 19 legacy paginated
 wrappers), so no live call site reaches these: measured, `endReached` appears
 once and `atBottomStateChange` never. They stay in the signature so the 12
 extenders keep compiling, and the scroll bookkeeping is deleted.

 PILOT-DECISION — **`ghost` keeps its co-located CSS, re-pointed.** It exists
 for exactly one placement — the select sitting on the header's brand-accent
 band — and the reasoning for `--color-on-dark` (recorded at length in
 `BAISelect.css`) is unchanged. What changed is the selector: the antd
 internals (`.ant-select-suffix`, `.ant-select-status-error`, the
 `.ant-select-content*` dimming rules) match nothing on Astryx (P6), so they
 are deleted and the ghost treatment is expressed against the wrapper class
 alone.

 PILOT-DECISION (QA2-B-1) — **the multiple-mode trigger shows LABELS, not a
 count.** Astryx `MultiSelector` defaults `triggerDisplay` to `'count'`, which
 renders "3 selected" where antd rendered the selected tags. That is a
 regression the call sites cannot see (they never passed the prop), so the
 default is flipped here, in the wrapper, and every `mode="multiple"` /
 `mode="tags"` call site inherits it untouched. Overflow policy comes from
 Astryx: the first THREE labels, comma-joined, then `, +N` — the count is
 hardcoded in `MultiSelector`, so antd's `maxTagCount` stays inert. `'badges'`
 (Astryx `Badge` chips, `maxBadges` deep) remains available per call site for
 anywhere the tag-pill look is worth the extra trigger height.

 PILOT-DECISION — **`label` is required by Astryx and defaults to hidden.**
 No antd call site passes one. The wrapper accepts `label` and otherwise
 derives an accessible name from `placeholder` (which every call site does
 pass: 28 of 64) before falling back to the translated generic — the same
 policy `BAIButton` / `BAICheckbox` / `BAIUncontrolledInput` use here.
*/
import { nodeToAccessibleLabel } from '../helper/astryxLabel';
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAISelect.css';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import {
  Selector,
  type SelectorOptionData,
  type SelectorOptionType,
} from '@astryxdesign/core/Selector';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

/** antd `DefaultOptionType`, restated locally. */
export interface BAISelectOption {
  value?: string | number | null;
  label?: ReactNode;
  disabled?: boolean;
  title?: string;
  // antd's `DefaultOptionType` carried an open index signature and call sites
  // read arbitrary keys off it (`option.data.description`,
  // `optionFilterProp: 'filterValue'`). `any` preserves that, exactly as antd
  // did — narrowing it to `unknown` broke three consumers this ticket does not
  // own (P1: never narrow a frontier wrapper's props from memory).
  [key: string]: any;
}

export type BAISelectValue = string | number | null | undefined;

export interface BAISelectProps<ValueType = any, OptionType = BAISelectOption> {
  options?: Array<OptionType>;
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: any, option?: any) => void;
  onSelect?: (value: any, option?: any) => void;
  placeholder?: ReactNode;
  /** antd's multi-value modes. */
  mode?: 'multiple' | 'tags';
  disabled?: boolean;
  loading?: boolean;
  allowClear?: boolean;
  /**
   * antd's `showSearch`, whose object form carries search configuration.
   * `filterOption` / `optionFilterProp` are accepted and INERT: Astryx's
   * `Selector` owns its own client-side filtering and exposes no predicate
   * hook, so a call site that pointed the filter at a synthetic option key
   * (`'filterValue'`, `'projectName'`) now filters on the option's own label —
   * which is the text the user is reading anyway.
   */
  showSearch?:
    | boolean
    | {
        searchValue?: string;
        onSearch?: (value: string) => void;
        filterOption?: boolean | ((input: string, option?: any) => boolean);
        optionFilterProp?: string;
      };
  status?: 'error' | 'warning' | '';
  size?: 'small' | 'middle' | 'large';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * antd handed the render function `{ data, label, value }`. The shape is
   * reproduced verbatim: `BAIProjectResourceGroupSelect` reads
   * `option.data.value` to highlight the search term.
   */
  optionRender?: (option: {
    data: BAISelectOption;
    label?: ReactNode;
    value?: string | number | null;
  }) => ReactNode;
  className?: string;
  style?: CSSProperties;
  autoFocus?: boolean;
  tabIndex?: number;
  /** Visible accessible name; derived from `placeholder` when absent. */
  label?: string;
  isLabelHidden?: boolean;
  /**
   * Accepted and inert on Astryx — each names an antd popup mechanism the
   * design system owns internally now. See the PILOT-DECISIONs above.
   */
  popupMatchSelectWidth?: boolean | number;
  popupRender?: (menu: ReactNode) => ReactNode;
  notFoundContent?: ReactNode;
  suffixIcon?: ReactNode;
  labelRender?: (props: any) => ReactNode;
  maxTagCount?: number | 'responsive';
  maxTagPlaceholder?: ReactNode | ((omitted: Array<any>) => ReactNode);
  /**
   * `mode="multiple"` / `mode="tags"` trigger rendering. Defaults to
   * `'labels'` (QA2-B-1) — Astryx's own default is `'count'` ("3 selected"),
   * which drops the information antd showed. `'badges'` renders `Badge` chips,
   * capped by {@link maxBadges}.
   */
  triggerDisplay?: 'count' | 'labels' | 'badges';
  /** Badges shown before "+N". Only meaningful with `triggerDisplay="badges"`. */
  maxBadges?: number;
  /**
   * antd's trigger-label source selector. Only `'children'` is honoured: the
   * selected option's rich node renders on the closed trigger (FR-3544).
   * Other values fall back to the flattened text label.
   */
  optionLabelProp?: string;
  filterOption?: boolean | ((input: string, option?: any) => boolean);
  defaultActiveFirstOption?: boolean;
  title?: string;
  /**
   * Accepted and inert. Call sites hold an antd `BaseSelectRef` (to call
   * `.focus()` / `.blur()`); Astryx's `Selector` exposes no imperative handle
   * (P26-8 already dropped `ref.focus()` in wave 1's select flip). The prop
   * stays so those `useRef` declarations keep compiling.
   */
  ref?: React.Ref<any>;

  // ---- BUI-specific props (unchanged contract) ----
  /**
   * antd's OTHER option API: `<Select.Option>` / `<Select.OptGroup>` children.
   * Flattened into Astryx's `options` model — see the body.
   */
  children?: ReactNode;
  ghost?: boolean;
  autoSelectOption?:
    boolean | ((options: Array<OptionType> | undefined) => ValueType);
  tooltip?: string;
  atBottomThreshold?: number;
  atBottomStateChange?: (atBottom: boolean) => void;
  bottomLoading?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  endReached?: () => void;
  searchAction?: (value: string) => Promise<void>;
  [key: `data-${string}`]: string | undefined;
}

const toOptionKey = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

function BAISelect<ValueType = any, OptionType = BAISelectOption>({
  ref: _ref,
  autoSelectOption,
  ghost,
  tooltip,
  atBottomThreshold: _atBottomThreshold,
  atBottomStateChange: _atBottomStateChange,
  bottomLoading: _bottomLoading,
  header,
  footer,
  endReached: _endReached,
  searchAction: _searchAction,
  options,
  value,
  defaultValue,
  onChange,
  onSelect,
  placeholder,
  mode,
  disabled,
  loading,
  allowClear,
  showSearch,
  status,
  size,
  optionRender,
  triggerDisplay = 'labels',
  maxBadges,
  children,
  className,
  style,
  label,
  isLabelHidden,
  // Accepted and inert — the antd popup mechanisms Astryx owns internally.
  popupMatchSelectWidth: _popupMatchSelectWidth,
  popupRender: _popupRender,
  notFoundContent: _notFoundContent,
  suffixIcon: _suffixIcon,
  labelRender: _labelRender,
  maxTagCount: _maxTagCount,
  maxTagPlaceholder: _maxTagPlaceholder,
  optionLabelProp,
  filterOption: _filterOption,
  defaultActiveFirstOption: _defaultActiveFirstOption,
  open: _open,
  onOpenChange: _onOpenChange,
  title: _title,
  ...restProps
}: BAISelectProps<ValueType, OptionType>): React.ReactElement {
  const { t } = useBAIi18n();

  // antd's OTHER option API: `<Select.Option>` / `<Select.OptGroup>` children.
  // Astryx's `Selector` is `options`-driven only, so the element tree is
  // flattened into the same option model — the group's `label` becomes a
  // `{type: 'section'}` entry (Astryx's native grouping), each option's JSX
  // body is kept for `renderOption`, and the option's flattened text becomes
  // its label. `filterValue` (the synthetic search key
  // `ImageEnvironmentSelectFormItems` sets) is NOT folded in — see FR-3499 at
  // the leaf branch below. Two call sites use this form; both nest options
  // inside OptGroups.
  const childOptions: Array<BAISelectOption> = [];
  const childSections: Array<SelectorOptionType> = [];
  if (options === undefined && children !== undefined) {
    const collect = (
      node: ReactNode,
      into: Array<BAISelectOption>,
    ): Array<SelectorOptionType> => {
      const out: Array<SelectorOptionType> = [];
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return;
        const childProps = child.props as {
          value?: unknown;
          label?: ReactNode;
          disabled?: boolean;
          filterValue?: string;
          children?: ReactNode;
        };
        // The BUI carriers are discriminated by TYPE; the prop-shape test only
        // remains for foreign elements, since options may carry `label` too
        // (FR-3544).
        const isOptGroup =
          child.type === BAISelectOptionGroup ||
          (child.type !== BAISelectOptionItem &&
            childProps.value === undefined &&
            childProps.label !== undefined);
        if (isOptGroup) {
          // OptGroup
          const groupOptions: Array<BAISelectOption> = [];
          collect(childProps.children, groupOptions);
          into.push(...groupOptions);
          out.push({
            type: 'section',
            title: nodeToAccessibleLabel(childProps.label),
            options: groupOptions.map((option) => ({
              value: toOptionKey(option.value),
              label: option.title ?? toOptionKey(option.value),
              disabled: option.disabled,
            })),
          });
          return;
        }
        // FR-3499 — the option label is the DISPLAY text, never the search key.
        // Astryx's `Selector` spends `SelectorOptionData.label` twice: the
        // dropdown filters on it AND the closed trigger renders it
        // (`selectedItem?.label`). There is no separate search field on the
        // option model. Folding `filterValue` in therefore printed the
        // synthetic search key onto the control itself — measured live on the
        // Session Launcher and the deployment Add-Revision modal, the trigger
        // read `PyTorch PyTorch` and
        // `2.1.0 x86_64 2.1.0\tPython 3.10\tx86_64\tGPU\tCUDA12.1\tUbuntu 22.04`,
        // tab separators and all. Search now filters on the text the user is
        // reading, which is exactly what the `optionFilterProp` PILOT-DECISION
        // above already specifies for the `options`-prop path; this makes the
        // two option APIs agree instead of only one of them corrupting itself.
        //
        // FR-3544 — rich rows keep their key facts in Badge/tag PROPS the
        // flattener cannot see, so an explicit `label` wins when provided.
        const displayLabel =
          nodeToAccessibleLabel(childProps.label) ||
          nodeToAccessibleLabel(childProps.children) ||
          toOptionKey(childProps.value);
        into.push({
          value: childProps.value as BAISelectOption['value'],
          label: childProps.children,
          disabled: childProps.disabled,
          title: displayLabel,
        });
        out.push({
          value: toOptionKey(childProps.value),
          label: displayLabel,
          disabled: childProps.disabled,
        });
      });
      return out;
    };
    childSections.push(...collect(children, childOptions));
  }

  // antd's `options` array is NOT flat: an entry carrying its own `options`
  // array is a GROUP (`{label, options}`), the array-form twin of
  // `<Select.OptGroup>`. `ProjectSelect` uses it whenever the user belongs to
  // more than one domain. Treating a group as a plain option gives it
  // `value === undefined`, which collapses every group onto the SAME empty
  // React key and silently drops the options inside it — caught live as
  // "Encountered two children with the same key ``" on /summary, /data and
  // /admin/project (see the ticket write-up). Groups become Astryx sections.
  const isOptionGroup = (option: BAISelectOption): boolean =>
    Array.isArray(option?.options);

  const flatSource =
    options === undefined && childOptions.length > 0
      ? childOptions
      : ((options ?? []) as Array<BAISelectOption>);

  // Every leaf option, group members included — the lookup table `onChange`
  // and `renderOption` resolve against.
  const rawOptions: Array<BAISelectOption> = flatSource.flatMap((option) =>
    isOptionGroup(option)
      ? ((option.options ?? []) as Array<BAISelectOption>)
      : [option],
  );

  // A ReactNode label is SPLIT: its text becomes the accessible name / search
  // key, and the node itself is rendered back through `renderOption` (P2).
  const nodeLabels = new Map<string, ReactNode>();
  const toAstryxOption = (option: BAISelectOption): SelectorOptionData => {
    const key = toOptionKey(option.value);
    const text = option.title ?? (nodeToAccessibleLabel(option.label) || key);
    return { value: key, label: text, disabled: option.disabled };
  };
  const astryxOptions: Array<SelectorOptionType> =
    childSections.length > 0
      ? childSections
      : flatSource.map((option) =>
          isOptionGroup(option)
            ? ({
                type: 'section',
                title: nodeToAccessibleLabel(option.label),
                options: ((option.options ?? []) as Array<BAISelectOption>).map(
                  toAstryxOption,
                ),
              } as SelectorOptionType)
            : toAstryxOption(option),
        );
  rawOptions.forEach((option) => {
    if (option.label !== undefined && typeof option.label !== 'string') {
      nodeLabels.set(toOptionKey(option.value), option.label);
    }
  });

  const optionsWithSlots: Array<SelectorOptionType> = [
    ...(_.isString(header)
      ? ([
          { type: 'section', title: header, options: [] },
        ] as Array<SelectorOptionType>)
      : []),
    ...astryxOptions,
    ...(_.isString(footer)
      ? ([
          { type: 'divider' },
          { value: '__bai_select_footer__', label: footer, disabled: true },
        ] as Array<SelectorOptionType>)
      : []),
  ];

  const renderOption = (option: SelectorOptionData): ReactNode => {
    const original = rawOptions.find(
      (candidate) => toOptionKey(candidate.value) === option.value,
    );
    if (optionRender && original) {
      return optionRender({
        data: original,
        label: original.label,
        value: original.value,
      });
    }
    return nodeLabels.get(option.value) ?? option.label ?? option.value;
  };

  const emitChange = (nextKey: string | null) => {
    const original = rawOptions.find(
      (candidate) => toOptionKey(candidate.value) === nextKey,
    );
    // The value the caller gets back is its OWN value, not the string key —
    // antd handed back `option.value`, and 14 `onChange` sites (plus the 12
    // extenders) depend on the original type.
    const nextValue = original ? original.value : (nextKey ?? undefined);
    onChange?.(nextValue, original);
    onSelect?.(nextValue, original);
  };

  /**
   * RESTORED (input-parity pass) — **`autoSelectOption` tells the caller
   * again.**
   *
   * antd's version ran a `useLayoutEffect` that CALLED `onChange` with the
   * first (or caller-chosen) option whenever the value was still empty. That
   * call is what wrote the value into the enclosing `Form.Item` or parent
   * state. The migration replaced it with a purely visual default — the
   * trigger rendered the first option, but nothing was ever emitted — so
   * `SessionOwnerSetterCard`'s two required fields SHOWED a selection the form
   * never received (submit then failed its own `required` rule), and
   * `ContainerLogModal` never learned which kernel to fetch logs for.
   */
  const autoSelectedValue =
    autoSelectOption && _.isEmpty(value) && rawOptions[0]
      ? _.isFunction(autoSelectOption)
        ? autoSelectOption(options)
        : (rawOptions[0].value ?? rawOptions[0])
      : undefined;
  const emitAutoSelection = React.useEffectEvent(() => {
    if (autoSelectedValue === undefined) return;
    onChange?.(autoSelectedValue as ValueType, rawOptions[0] as OptionType);
  });
  React.useLayoutEffect(() => {
    emitAutoSelection();
  }, [autoSelectedValue]);

  const accessibleLabel =
    label ?? nodeToAccessibleLabel(placeholder) ?? t('general.Select');

  const singleValue = toOptionKey(value ?? defaultValue);
  const resolvedSingleValue =
    mode === undefined && singleValue === '' && autoSelectOption
      ? toOptionKey(
          _.isFunction(autoSelectOption)
            ? autoSelectOption(options)
            : rawOptions[0]?.value,
        )
      : singleValue;
  const richTriggerNode =
    mode === undefined &&
    resolvedSingleValue !== '' &&
    optionLabelProp === 'children'
      ? nodeLabels.get(resolvedSingleValue)
      : undefined;

  const shared = {
    ...restProps,
    // `nodeLabels` holds non-string labels only, so `renderIconSlot` renders
    // this node as-is instead of wrapping it in an `Icon` (FR-3544).
    ...(richTriggerNode !== undefined && {
      // The clone is decorative; the trigger button's visually-hidden string
      // label stays the single accessible selected value.
      startIcon: (
        <span className="bai-select-rich-value" aria-hidden="true">
          {richTriggerNode}
        </span>
      ),
    }),
    className: classNames(
      className,
      'bai-select',
      ghost && 'bai-select-ghost',
      richTriggerNode !== undefined && 'bai-select-rich-trigger',
    ),
    label: accessibleLabel || t('general.Select'),
    isLabelHidden: isLabelHidden ?? label === undefined,
    // `tooltip` was an antd `Tooltip` WRAPPING the whole control; Astryx
    // fields carry their own `labelTooltip`, which is the same information
    // attached to the field rather than to a wrapper element.
    labelTooltip: tooltip || undefined,
    placeholder:
      typeof placeholder === 'string'
        ? placeholder
        : nodeToAccessibleLabel(placeholder) || undefined,
    isDisabled: disabled,
    isLoading: loading,
    // RESTORED (input-parity pass): antd's `composedShowSearch` returned
    // `baseShowSearch ?? true`, so a `BAISelect` that says nothing about
    // search was type-to-filter. Treating `undefined` as "no search" turned
    // that off on every call site that omitted the prop.
    hasSearch: showSearch !== false,
    status:
      status === 'error' || status === 'warning' ? { type: status } : undefined,
    size:
      size === 'small'
        ? ('sm' as const)
        : size === 'large'
          ? ('lg' as const)
          : undefined,
    width: style?.width,
    style,
    renderOption,
  };

  if (mode === 'multiple' || mode === 'tags') {
    const selected = _.isArray(value)
      ? (value as Array<unknown>).map(toOptionKey)
      : _.isArray(defaultValue)
        ? (defaultValue as Array<unknown>).map(toOptionKey)
        : [];
    return (
      <MultiSelector
        {...shared}
        options={optionsWithSlots}
        value={selected}
        // QA2-B-1: labels, not "N selected". See the PILOT-DECISION above.
        triggerDisplay={triggerDisplay}
        maxBadges={maxBadges}
        hasClear={allowClear}
        onChange={(next) => {
          const originals = next.map(
            (key) =>
              rawOptions.find(
                (candidate) => toOptionKey(candidate.value) === key,
              )?.value ?? key,
          );
          onChange?.(originals, undefined);
        }}
      />
    );
  }

  return (
    <Selector
      // QA-FINDINGS Q-34 — `placement` is the documented opt-out from
      // Astryx's selected-item overlay, and every search-less `BAISelect`
      // needs it. `Selector` computes
      // `shouldOverlaySelectedItem = placement == null && !hasSearch`, and
      // when that is true it applies a negative `margin-block-start` sized to
      // centre the SELECTED option on top of the trigger — so the field's
      // label and its current value both disappear behind the panel the moment
      // it opens. antd's `Select` never drew its dropdown over its trigger, so
      // this reads as a broken control rather than a style. Naming a placement
      // takes the standard layer-positioning path (offset 0, panel below), and
      // `MultiSelector` already hard-codes exactly this. Written BEFORE the
      // spread so a call site that genuinely wants `above` still wins.
      placement="below"
      {...shared}
      options={optionsWithSlots}
      hasClear={allowClear}
      // `autoSelectOption` is honoured without the antd layout effect: when
      // nothing is selected the resolved first (or caller-chosen) option is
      // the rendered value, and the caller is told on mount by the same
      // `onChange` it used to receive.
      value={resolvedSingleValue}
      onChange={(next: string | null) => emitChange(next)}
    />
  );
}

/**
 * Carrier element for the `<Select.Option>` children API, replacing antd's
 * (phase 3, wave 3).
 *
 * `BAISelect` already accepts the children form and flattens it into Astryx's
 * `options` model — but the elements themselves were still antd's
 * `Select.Option` / `Select.OptGroup`, which kept three otherwise-converted
 * files importing antd for a component that is never rendered. The flattener
 * discriminates these carriers by element type (falling back to the antd
 * prop-shape test for foreign elements), so a render-null marker is a
 * complete replacement.
 *
 * These do NOT render. They exist to be walked by `BAISelect`; putting one
 * anywhere else produces nothing.
 */
export interface BAISelectOptionProps {
  value?: BAISelectOption['value'];
  /**
   * antd's `optionLabelProp="label"` slot: the string the closed trigger
   * shows (and search matches) when `children` is rich JSX whose key facts
   * live in props the text flattener cannot reach (FR-3544).
   */
  label?: string;
  disabled?: boolean;
  /**
   * Accepted and IGNORED, for antd's `optionFilterProp="filterValue"` call
   * sites. Search matches the option's visible text only — Astryx renders the
   * option label on the trigger too, so a search key folded into it leaks
   * there (FR-3499).
   */
  filterValue?: string;
  /** The option row. May be rich JSX — it survives via `renderOption`. */
  children?: ReactNode;
}

export const BAISelectOptionItem: React.FC<BAISelectOptionProps> = () => null;

export interface BAISelectOptionGroupProps {
  /** Section heading. Flattened to a string for the accessible name. */
  label?: ReactNode;
  children?: ReactNode;
}

export const BAISelectOptionGroup: React.FC<BAISelectOptionGroupProps> = () =>
  null;

export default BAISelect;
