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
    /** The value staged in the popover (an existing token's value in edit mode). */
    value: string | null;
    isDisabled?: boolean;
}) => ReactNode;
/** One selectable entity: the opaque id the filter serializes plus its label. */
export interface FilterEntity {
    id: string;
    label: string;
    description?: string;
}
/**
 * Declarative replacement for `renderInput` on properties whose value is an
 * opaque id. The host builds it, so Relay stays outside these components.
 */
export interface FilterEntitySource {
    /** Per-keystroke lookup; debounced by the editor (150 ms). */
    search: (query: string) => Promise<Array<FilterEntity>> | Array<FilterEntity>;
    /** Shown when the editor opens with an empty query. Enables entries-on-focus. */
    bootstrap?: () => Promise<Array<FilterEntity>> | Array<FilterEntity>;
    /** id -> label for ids restored from the URL. Omit and tokens show the raw id. */
    resolve?: (ids: ReadonlyArray<string>) => Promise<Array<FilterEntity>>;
    /** Abort in-flight work; forwarded to Typeahead/Tokenizer. */
    cancel?: () => void;
}
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
export interface EntityLabelCache {
    record: (propertyKey: string, id: string, label: string) => void;
    recordMany: (propertyKey: string, entities: ReadonlyArray<FilterEntity>) => void;
    resolveLabel: (propertyKey: string, id: string) => string;
    /** Fires `source.resolve` once per unseen id; failures fall back to the raw id. */
    ensureResolved: (propertyKey: string, source: FilterEntitySource | undefined, ids: ReadonlyArray<string>) => void;
}
/**
 * `${propertyKey}::${id}` -> human readable label, e.g. a user UUID -> email.
 * State, not just a ref: PowerSearch recomputes its token strings only when
 * the `config` identity changes, which needs a re-render.
 */
export declare function useEntityLabelCache(): EntityLabelCache;
/** Multi values ride as a JSON array — Astryx stores custom values as strings. */
export declare const encodeEntityIds: (ids: ReadonlyArray<string>, isMulti: boolean) => string | null;
/** Malformed input yields an empty selection rather than throwing. */
export declare const decodeEntityIds: (value: string | null | undefined, isMulti: boolean) => Array<string>;
export interface BAIPowerSearchEntityEditorProps {
    /** Namespaces the label cache; the filter property this editor edits. */
    propertyKey: string;
    source: FilterEntitySource | undefined;
    labels: EntityLabelCache;
    /** List operators (`in` / `notIn`) get a Tokenizer, everything else a Typeahead. */
    isMulti: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    isDisabled?: boolean;
}
/**
 * Controlled editor behind a PowerSearch `custom` operator value: it stages the
 * picked id(s) and the popover's Apply commits them.
 */
export declare const BAIPowerSearchEntityEditor: ({ propertyKey, source, labels, isMulti, value, onChange, placeholder, isDisabled, }: BAIPowerSearchEntityEditorProps) => React.JSX.Element;
export interface EntityEditorsOptions {
    labels: EntityLabelCache;
}
export interface EntityEditors {
    /**
     * Returns the `custom` operator value for a property that supplies
     * `entitySource`, or `undefined` when it does not.
     */
    operatorValueFor: (propertyKey: string, source: FilterEntitySource | undefined, isMulti: boolean) => CustomOperatorValue | undefined;
}
/** Builds (and caches) one `custom` operator value per `${key}::${arity}`. */
export declare function useEntityEditors({ labels, }: EntityEditorsOptions): EntityEditors;
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
