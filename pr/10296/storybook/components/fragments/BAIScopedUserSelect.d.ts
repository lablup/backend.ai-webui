import { BAIScopedUserSelectPaginatedQuery, UserScope } from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIScopedUserSelectFilter = NonNullable<BAIScopedUserSelectPaginatedQuery['variables']['filter']>;
export type ScopedUserNode = NonNullable<NonNullable<BAIScopedUserSelectPaginatedQuery['response']['scopedUsersV2']>['edges'][number]>['node'];
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
     * The second argument carries the labelInValue pair(s), so a caller can
     * show the email while the raw UUID goes into a filter or mutation input.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAIScopedUserSelectOption | Array<BAIScopedUserSelectOption>) => void;
    /** The users this scope reaches are listed, usually the current domain (ADR 0012). */
    scope: UserScope;
    /**
     * Offer the typed search text as an option when it is an e-mail address no
     * listed user matches, so an address outside the scope can still be picked.
     * The pick's value is that address and its option carries `isCustom`.
     * Only under `valuePropName="email"`.
     */
    allowCustomSelect?: boolean;
    filter?: BAIScopedUserSelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIScopedUserSelectRef>;
}
declare const BAIScopedUserSelect: React.FC<BAIScopedUserSelectProps>;
export default BAIScopedUserSelect;
