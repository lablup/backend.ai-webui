import { BAIPowerSearchChromeProps, FilterPropertyOption, FilterRenderInput } from './BAIPowerSearchAdapters';
import { FilterValue, PowerSearchFilter } from '@astryxdesign/core/PowerSearch';
export type StringFilter = {
    contains?: string | null;
    startsWith?: string | null;
    endsWith?: string | null;
    equals?: string | null;
    notContains?: string | null;
    notStartsWith?: string | null;
    notEndsWith?: string | null;
    notEquals?: string | null;
    iContains?: string | null;
    iStartsWith?: string | null;
    iEndsWith?: string | null;
    iEquals?: string | null;
    iNotContains?: string | null;
    iNotStartsWith?: string | null;
    iNotEndsWith?: string | null;
    iNotEquals?: string | null;
};
export type IntFilter = {
    equals?: number | null;
    notEquals?: number | null;
    greaterThan?: number | null;
    greaterThanOrEqual?: number | null;
    lessThan?: number | null;
    lessThanOrEqual?: number | null;
};
export type UUIDFilter = {
    equals?: string | null;
    notEquals?: string | null;
    in?: string[] | null;
    notIn?: string[] | null;
};
export type DateTimeFilter = {
    before?: string | null;
    after?: string | null;
    equals?: string | null;
    notEquals?: string | null;
};
export type BooleanFilter = boolean;
export type EnumFilter<T = string> = {
    equals?: T | null;
    notEquals?: T | null;
    in?: T[] | null;
    notIn?: T[] | null;
};
export type BaseFilter<T = any> = {
    AND?: T[] | T | null;
    OR?: T[] | T | null;
    NOT?: T | null;
};
export type GraphQLFilter = BaseFilter & {
    [key: string]: any;
};
export type FilterPropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'uuid' | 'datetime';
export type FilterOperator = 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notContains' | 'notStartsWith' | 'notEndsWith' | 'notEquals' | 'iContains' | 'iStartsWith' | 'iEndsWith' | 'iEquals' | 'iNotContains' | 'iNotStartsWith' | 'iNotEndsWith' | 'iNotEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual' | 'in' | 'notIn' | 'before' | 'after' | (string & NonNullable<unknown>);
type BaseFilterProperty = {
    key: string;
    propertyLabel: string;
    /**
     * Kept for source compatibility; PowerSearch has a single control-level
     * placeholder, so this is no longer rendered (see the PILOT-DECISIONs).
     */
    placeholder?: string;
    type: FilterPropertyType;
    operators?: FilterOperator[];
    options?: Array<FilterPropertyOption>;
    strictSelection?: boolean;
    /**
     * Advisory since ticket 28: a violating token is reported through the
     * control's error status instead of being refused at commit time.
     */
    rule?: {
        message: string;
        validate: (value: any) => boolean;
    };
    valueMode?: 'scalar' | 'operator';
    implicitOperator?: FilterOperator;
    /**
     * Replaces the built-in value editor with a controlled control (e.g.
     * `BAIUserSelect`). Call `onAddCondition(value, label?)` to stage the value;
     * the popover's Apply button commits it. Pass the human-readable `label`
     * when the committed value is opaque (e.g. a UUID) so the token shows the
     * label while the raw value still serializes into the filter unchanged.
     */
    renderInput?: FilterRenderInput;
};
export type FilterProperty = BaseFilterProperty & ({
    fixedOperator: FilterOperator;
    defaultOperator?: never;
} | {
    defaultOperator?: FilterOperator;
    fixedOperator?: never;
} | {
    defaultOperator?: never;
    fixedOperator?: never;
});
export interface BAIGraphQLPropertyFilterProps<TFilter extends GraphQLFilter = GraphQLFilter> extends BAIPowerSearchChromeProps {
    value?: TFilter;
    onChange?: (value: TFilter | undefined) => void;
    defaultValue?: TFilter;
    filterProperties: Array<FilterProperty>;
    loading?: boolean;
    combinationMode?: 'AND' | 'OR';
    singleCondition?: boolean;
}
interface FilterCondition {
    id: string;
    property: string;
    operator: FilterOperator;
    value: any;
    propertyLabel: string;
    type: FilterPropertyType;
}
/**
 * Builds a nested object from a dot-notation path.
 * e.g., "project.name" with value { eq: "test" } -> { project: { name: { eq: "test" } } }
 */
export declare function buildNestedFilter(path: string, value: any): GraphQLFilter;
/** Operators offered for a property — the antd rules, unchanged. */
export declare function availableOperatorsOf(property: FilterProperty): Array<FilterOperator>;
/** FilterCondition -> the token value shape the editor above expects. */
export declare function conditionToTokenValue(condition: FilterCondition, property: FilterProperty | undefined): FilterValue;
/** Exact inverse of `conditionToTokenValue`. */
export declare function tokenValueToConditionValue(value: FilterValue): any;
/**
 * GraphQL filter object -> PowerSearch tokens. Composed of the (unchanged)
 * object->conditions reverse parser and the token-value mapper, so the URL
 * round trip is testable without mounting the component.
 */
export declare function graphQLFilterToPowerSearchFilters(value: GraphQLFilter | undefined, filterProperties: Array<FilterProperty>): Array<PowerSearchFilter>;
/** Exact inverse of `graphQLFilterToPowerSearchFilters`. */
export declare function powerSearchFiltersToGraphQLFilter(filters: ReadonlyArray<PowerSearchFilter>, filterProperties: Array<FilterProperty>, combinationMode?: 'AND' | 'OR', singleCondition?: boolean): GraphQLFilter | undefined;
declare const BAIGraphQLPropertyFilter: <TFilter extends GraphQLFilter = GraphQLFilter>({ filterProperties, value: propValue, onChange: propOnChange, defaultValue, combinationMode, singleCondition, label, placeholder, applyLabel, resultCount, contentSearchFieldKey, isDisabled, size, style, className, loading, "data-testid": dataTestId, }: BAIGraphQLPropertyFilterProps<TFilter>) => import("react").JSX.Element;
export default BAIGraphQLPropertyFilter;
