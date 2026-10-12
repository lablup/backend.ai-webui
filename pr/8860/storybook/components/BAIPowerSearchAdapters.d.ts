import { CustomOperatorValue, EnumItem } from '@astryxdesign/core/PowerSearch';
import { SearchSource } from '@astryxdesign/core/Typeahead';
import { default as React, ReactNode } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * The option shape both filters accept. Structurally the subset of antd's
 * `DefaultOptionType` that the call sites actually populate — declared here so
 * neither filter has to import an antd type just to describe its own props.
 */
export type FilterPropertyOption = {
    label?: ReactNode;
    value?: string | number | null;
    disabled?: boolean;
};
/** The `renderInput` escape hatch shared by both filters (FR-3011 / FR-3258). */
export type FilterRenderInput = (props: {
    onAddCondition: (value: string | undefined, label?: string) => void;
}) => ReactNode;
/** Only string-ish labels survive into a token; anything else falls back. */
export declare const optionLabelToString: (label: ReactNode, fallback: string) => string;
/** BUI option list -> PowerSearch enum items (both fields are required there). */
export declare function toEnumItems(options: ReadonlyArray<FilterPropertyOption> | undefined): Array<EnumItem>;
/**
 * BUI option list -> Typeahead `SearchSource`, used for properties that offer
 * suggestions but still accept free text (`options` without `strictSelection`).
 * The antd `AutoComplete` matched on the option LABEL, so this does too.
 */
export declare function toSearchSource(options: ReadonlyArray<FilterPropertyOption> | undefined): SearchSource | undefined;
export interface RenderInputEditorsOptions {
    /** `${propertyKey}::${value}` -> human readable label, e.g. UUID -> email. */
    recordLabel: (property: string, value: string, label: string) => void;
    /** Reverse lookup used by the token's display string. */
    resolveLabel: (property: string, value: string) => string;
}
export interface RenderInputEditors {
    /**
     * Returns the `custom` operator value for a property that supplies
     * `renderInput`, or `undefined` when it does not.
     */
    operatorValueFor: (propertyKey: string, renderInput: FilterRenderInput | undefined) => CustomOperatorValue | undefined;
}
/**
 * Builds (and caches) one `custom` operator value per `renderInput` property.
 *
 * PILOT-DECISION: the antd filter committed a condition the instant the
 * control emitted a value. PowerSearch owns the commit (its popover has an
 * Apply button), so the control now stages the value and the user confirms.
 * One extra click; the alternative was reimplementing the popover.
 */
export declare function useRenderInputEditors({ recordLabel, resolveLabel, }: RenderInputEditorsOptions): RenderInputEditors;
/**
 * Chrome props both filters expose on top of their antd-era contract. They are
 * pass-throughs to `PowerSearch`; every one of them has a BUI-catalog default
 * so that an untouched call site still renders translated chrome.
 */
export interface BAIPowerSearchChromeProps {
    /** Accessible label for the search input. */
    label?: string;
    /** Placeholder shown while no token is present. */
    placeholder?: string;
    /** Label of the edit popover's confirm button. */
    applyLabel?: string;
    /**
     * Pre-formatted result count. Passed to PowerSearch as a STRING so the host's
     * own pluralisation wins over Astryx's "N results".
     *
     * @deprecated FR-3588 — Power search shows no result count. Kept only so the
     * published API stays source-compatible; drop it in the next major.
     */
    resultCount?: string;
    /**
     * Property key that bare, un-prefixed text is committed against. Defaults to
     * the first free-text property, which reproduces the antd filter's
     * "the first property is preselected" behaviour.
     */
    contentSearchFieldKey?: string;
    /** Disables the whole control. */
    isDisabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    style?: React.CSSProperties;
    className?: string;
    'data-testid'?: string;
}
