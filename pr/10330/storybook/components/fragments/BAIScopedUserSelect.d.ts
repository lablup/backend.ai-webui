import { BAIScopedUserSelectPaginatedQuery } from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIScopedUserSelectFilter = NonNullable<BAIScopedUserSelectPaginatedQuery['variables']['filter']>;
export type BAIScopedUserSelectScope = BAIScopedUserSelectPaginatedQuery['variables']['scope'];
export type ScopedUserV2Node = NonNullable<NonNullable<BAIScopedUserSelectPaginatedQuery['response']['scopedUsersV2']>['edges'][number]>['node'];
export interface BAIScopedUserSelectRef {
    refetch: () => void;
}
/** What `onChange` hands back beside the key: a listed user's id, or the custom mark. */
export type BAIScopedUserSelectOption = BAILabeledValue & {
    /** Local user id of a listed user. */
    userId?: string;
    /** Set when the value was typed and offered through `allowCustomSelect`. */
    isCustom?: boolean;
};
export interface BAIScopedUserSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
    value?: string | Array<string> | null;
    /**
     * P3C-1: the second `option` argument carries the labelInValue pair(s), so a
     * caller can show the email while the raw UUID goes into a mutation input.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAIScopedUserSelectOption | Array<BAIScopedUserSelectOption>) => void;
    /**
     * Offer the typed search text as an option when it is an e-mail address no
     * listed user matches, so an address outside the scope can still be picked.
     * The pick's value is that address and its option carries `isCustom`.
     * Only under `valuePropName="email"`.
     */
    allowCustomSelect?: boolean;
    /** Domain id(s) whose users are listed. Left out of the scope when omitted. */
    domainId?: string | Array<string> | null;
    /** Project id(s) whose users are listed. Left out of the scope when omitted. */
    projectId?: string | Array<string> | null;
    /** Role id(s) whose holders are listed. Left out of the scope when omitted. */
    roleId?: string | Array<string> | null;
    filter?: BAIScopedUserSelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIScopedUserSelectRef>;
}
declare const BAIScopedUserSelect: React.FC<BAIScopedUserSelectProps>;
export default BAIScopedUserSelect;
