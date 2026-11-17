import { default as React, CSSProperties, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** antd `DefaultOptionType`, restated locally. */
export interface BAISelectOption {
    value?: string | number | null;
    label?: ReactNode;
    disabled?: boolean;
    title?: string;
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
    showSearch?: boolean | {
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
    /**
     * antd's OTHER option API: `<Select.Option>` / `<Select.OptGroup>` children.
     * Flattened into Astryx's `options` model — see the body.
     */
    children?: ReactNode;
    ghost?: boolean;
    autoSelectOption?: boolean | ((options: Array<OptionType> | undefined) => ValueType);
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
declare function BAISelect<ValueType = any, OptionType = BAISelectOption>({ ref: _ref, autoSelectOption, ghost, tooltip, atBottomThreshold: _atBottomThreshold, atBottomStateChange: _atBottomStateChange, bottomLoading: _bottomLoading, header, footer, endReached: _endReached, searchAction: _searchAction, options, value, defaultValue, onChange, onSelect, placeholder, mode, disabled, loading, allowClear, showSearch, status, size, optionRender, triggerDisplay, maxBadges, children, className, style, label, isLabelHidden, popupMatchSelectWidth: _popupMatchSelectWidth, popupRender: _popupRender, notFoundContent: _notFoundContent, suffixIcon: _suffixIcon, labelRender: _labelRender, maxTagCount: _maxTagCount, maxTagPlaceholder: _maxTagPlaceholder, optionLabelProp, filterOption: _filterOption, defaultActiveFirstOption: _defaultActiveFirstOption, open: _open, onOpenChange: _onOpenChange, title: _title, ...restProps }: BAISelectProps<ValueType, OptionType>): React.ReactElement;
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
export declare const BAISelectOptionItem: React.FC<BAISelectOptionProps>;
export interface BAISelectOptionGroupProps {
    /** Section heading. Flattened to a string for the accessible name. */
    label?: ReactNode;
    children?: ReactNode;
}
export declare const BAISelectOptionGroup: React.FC<BAISelectOptionGroupProps>;
export default BAISelect;
