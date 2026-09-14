import { BAIPowerSearchChromeProps, FilterPropertyOption, FilterRenderInput } from './BAIPowerSearchAdapters';
import { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type { FilterPropertyOption } from './BAIPowerSearchAdapters';
export type FilterProperty = {
    key: string;
    defaultOperator?: string;
    propertyLabel: string;
    /**
     * Decides quoting and the operator menu. `number` values are emitted bare so
     * the DSL parses them as numbers; `datetime` and `uuid` stay quoted. `uuid`
     * offers equality only — a UUID column has no `ilike`.
     * TODO: support array.
     */
    type: 'string' | 'boolean' | 'number' | 'datetime' | 'uuid';
    options?: Array<FilterPropertyOption>;
    strictSelection?: boolean;
    /**
     * Advisory since ticket 28: a violating token is reported through the
     * control's error status instead of being refused at commit time.
     */
    rule?: {
        message: string;
        validate: (value: string) => boolean;
    };
    /**
     * Replaces the built-in value editor with a controlled control (e.g.
     * `BAIUserSelect`). Call `onAddCondition(value, label?)` to stage the value;
     * the popover's Apply button commits it. Pass the human-readable `label`
     * when the committed value is opaque (e.g. a UUID) so the token shows the
     * label while the raw value still serializes unchanged.
     */
    renderInput?: FilterRenderInput;
};
export interface BAIPropertyFilterProps extends BAIPowerSearchChromeProps {
    value?: string;
    onChange?: (value: string) => void;
    defaultValue?: string;
    filterProperties: Array<FilterProperty>;
    loading?: boolean;
}
export declare function mergeFilterValues(filterStrings: Array<string | undefined | null>, operator?: string): string | undefined;
/**
 * Parses `property operator value` into its three parts, dropping the value's
 * surrounding double quotes.
 */
export declare function parseFilterValue(filter: string): {
    property: string;
    operator: string;
    value: string;
};
/**
 * How one field serializes. Derived from `filterProperties` for configured
 * properties, and from the inbound string for anything else.
 */
interface FieldSpec {
    key: string;
    label: string;
    /** Picks the value editor. Synthesised fields are always `string`. */
    type: FilterProperty['type'];
    /** `number` and `boolean` values are bare; everything else double-quoted. */
    quote: boolean;
    isEnum: boolean;
    options?: Array<FilterPropertyOption>;
    strictSelection?: boolean;
    renderInput?: FilterRenderInput;
    operators: Array<string>;
    defaultOperator: string;
    rule?: FilterProperty['rule'];
    /** True when the field was invented from `value`, not declared by the page. */
    synthetic: boolean;
}
/**
 * Builds the field table used for BOTH parsing and serialising: the declared
 * properties, widened by whatever the inbound `value` actually contains.
 * Widening (rather than dropping) is what keeps an old shared link editable
 * and byte-stable.
 */
export declare function buildFieldSpecs(filterProperties: Array<FilterProperty>, value: string | undefined): Array<FieldSpec>;
/**
 * Field key that bare typed text is committed against. Mirrors the antd
 * filter, whose property `Select` started on the first entry.
 */
export declare function defaultContentSearchFieldKey(filterProperties: Array<FilterProperty>): string | undefined;
export interface ParsedFilterString {
    filters: Array<PowerSearchFilter>;
    /** Original, still-wrapped value fragments, keyed by `rawKey`. */
    rawValues: Record<string, string>;
}
/**
 * Backend.AI filter DSL -> PowerSearch tokens. Exact inverse of
 * `serializeFilters` (given the same field specs).
 */
export declare function parseFilterString(value: string | undefined, specs: Array<FieldSpec>): ParsedFilterString;
/**
 * PowerSearch tokens -> the Backend.AI filter DSL. `rawValues` (from the
 * parse of the current `value`) lets an untouched token re-emit its original
 * wildcard shape verbatim.
 */
export declare function serializeFilters(filters: ReadonlyArray<PowerSearchFilter>, specs: Array<FieldSpec>, rawValues?: Record<string, string>): string | undefined;
/**
 * BAIPropertyFilter — token-based filter bar over the Backend.AI queryfilter
 * minilang. Emits (and accepts) the filter string that the page keeps in its
 * URL and forwards to GraphQL.
 *
 * @example
 * ```tsx
 * <BAIPropertyFilter
 *   filterProperties={[
 *     { key: 'name', propertyLabel: 'Name', type: 'string' },
 *     { key: 'active', propertyLabel: 'Active', type: 'boolean' },
 *   ]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 * ```
 */
declare const BAIPropertyFilter: React.FC<BAIPropertyFilterProps>;
export default BAIPropertyFilter;
