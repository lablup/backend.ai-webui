import { ComplexSelectorSize, ComplexSelectorStatus } from '@astryxdesign/core/ComplexSelector';
import { SizeValue } from '@astryxdesign/core/utils';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * antd `labelInValue` shape, kept verbatim. `BAISelect` consumers already
 * build and consume exactly this object.
 */
export interface BAILabeledValue {
    label: string;
    value: string;
}
export type BAIComplexSelectValue = BAILabeledValue | Array<BAILabeledValue> | null;
/**
 * How the trigger renders the selection in `multiple` mode. Mirrors Astryx
 * `MultiSelector`'s prop of the same name, minus `'count'` — "N selected"
 * hides the very information the trigger exists to show (QA2-B-1).
 */
export type BAIComplexSelectTriggerDisplay = 'labels' | 'badges';
export interface BAIComplexSelectOption {
    value: string;
    /** MUST be a string (P26-3) — it is the trigger text and accessible name. */
    label: string;
    /** Secondary line under the label (antd `optionRender` subtitle shape). */
    description?: React.ReactNode;
    /** Trailing rich content (badges, tags, meta) — the other half of P26-3. */
    extra?: React.ReactNode;
    disabled?: boolean;
}
export interface BAIComplexSelectProps {
    /** Accessible name. Required by every Astryx field. */
    label: string;
    /** Hide the rendered label — set this inside a `Form.Item`/`BAIFormItem`. */
    isLabelHidden?: boolean;
    /** `labelInValue`-shaped. Array iff `multiple`. */
    value?: BAIComplexSelectValue;
    onChange?: (value: BAIComplexSelectValue) => void;
    options?: Array<BAIComplexSelectOption>;
    multiple?: boolean;
    placeholder?: string;
    /** antd `showSearch`. */
    hasSearch?: boolean;
    /** Controlled search text (server-side search). */
    searchValue?: string;
    /** antd `onSearch` — fires on every keystroke; debounce upstream. */
    onSearch?: (value: string) => void;
    searchPlaceholder?: string;
    /** antd `loading` — spinner on the trigger. */
    isLoading?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
    isOptional?: boolean;
    description?: string;
    status?: ComplexSelectorStatus;
    size?: ComplexSelectorSize;
    width?: SizeValue;
    /**
     * antd `BAISelect.endReached` — fired once each time the option list is
     * scrolled to within `atBottomThreshold` px of the bottom. Wire this to
     * Relay's `loadNext`.
     */
    endReached?: () => void;
    /** antd `BAISelect.atBottomThreshold`. */
    atBottomThreshold?: number;
    /** antd `BAISelect.atBottomStateChange`. */
    atBottomStateChange?: (atBottom: boolean) => void;
    /** Spinner next to the count while the next page is in flight. */
    isLoadingNext?: boolean;
    /** Total row count from the connection — renders the "Total N items" foot. */
    total?: number;
    /** antd `BAISelect.header` (rendered above the option list). */
    header?: React.ReactNode;
    /** antd `BAISelect.footer` (rendered below the option list). */
    footer?: React.ReactNode;
    /** antd `notFoundContent`. */
    emptyContent?: React.ReactNode;
    /**
     * Reports popup open/close. `BAIUserSelect` and friends use this to flip
     * `fetchPolicy` between `network-only` (open) and `store-only` (closed).
     */
    onOpenChange?: (open: boolean) => void;
    /** Scroll-viewport height of the option list. */
    listMaxHeight?: number;
    /**
     * Multiple-mode trigger rendering. Defaults to `'labels'` — the selected
     * labels, comma-joined (QA2-B-1). `'badges'` renders them as `Token` chips.
     */
    triggerDisplay?: BAIComplexSelectTriggerDisplay;
    /** Labels/chips shown in the trigger before collapsing to "+N" (P26-4). */
    maxTriggerTokens?: number;
    'data-testid'?: string;
}
declare const BAIComplexSelect: React.FC<BAIComplexSelectProps>;
export default BAIComplexSelect;
