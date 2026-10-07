import { PagedSelectorSingleProps } from '@lablup/ui-common/components/PagedSelector';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/** antd `labelInValue` shape. */
export interface BAILabeledValue {
    label: string;
    value: string;
}
export type BAIComplexSelectValue = BAILabeledValue | Array<BAILabeledValue> | null;
/** How the trigger renders a `multiple` selection. */
export type BAIComplexSelectTriggerDisplay = 'labels' | 'badges';
export interface BAIComplexSelectOption {
    value: string;
    /** The trigger text and the row's accessible name. */
    label: string;
    /** Drawn in the row in place of `label`. */
    labelContent?: React.ReactNode;
    /** Leading visual (avatar, glyph). */
    icon?: React.ReactNode;
    /** Secondary line under the label. */
    description?: React.ReactNode;
    /** Trailing content (tokens, meta). */
    extra?: React.ReactNode;
    disabled?: boolean;
}
/** PagedSelector props this adapter renames or owns. */
type OwnedPagedSelectorKey = 'isMultiple' | 'value' | 'onChange' | 'options' | 'labels' | 'onSearchChange' | 'hasClear' | 'onEndReached' | 'endReachedThreshold' | 'onAtEndChange' | 'isLoadingMore' | 'totalCount' | 'emptyText' | 'maxTriggerItems' | 'selectionIndicator' | 'triggerDisplay';
export interface BAIComplexSelectProps extends Omit<PagedSelectorSingleProps, OwnedPagedSelectorKey> {
    /** `labelInValue`-shaped. Array iff `multiple`. */
    value?: BAIComplexSelectValue;
    onChange?: (value: BAIComplexSelectValue) => void;
    options?: Array<BAIComplexSelectOption>;
    multiple?: boolean;
    /** Fires on every keystroke; debounce upstream. */
    onSearch?: (value: string) => void;
    /** Fired once each time the list is scrolled to within `atBottomThreshold` px of its end. */
    endReached?: () => void;
    atBottomThreshold?: number;
    atBottomStateChange?: (atBottom: boolean) => void;
    /** Spinner next to the count while the next page is in flight. */
    isLoadingNext?: boolean;
    /** Total row count from the connection — renders the "Total N items" foot. */
    total?: number;
    /** Replaces the empty list's content, the loading row included. */
    emptyContent?: React.ReactNode;
    triggerDisplay?: BAIComplexSelectTriggerDisplay;
    maxTriggerTokens?: number;
    allowClear?: boolean;
    selectionMark?: 'check' | 'checkbox';
}
declare const BAIComplexSelect: React.FC<BAIComplexSelectProps>;
export default BAIComplexSelect;
