import { BAIScopedUserSelectPaginatedQuery, UserScope } from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIScopedUserSelectFilter = NonNullable<BAIScopedUserSelectPaginatedQuery['variables']['filter']>;
export type ScopedUserNode = NonNullable<NonNullable<BAIScopedUserSelectPaginatedQuery['response']['scopedUsersV2']>['edges'][number]>['node'];
export interface BAIScopedUserSelectRef {
    refetch: () => void;
}
export interface BAIScopedUserSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
    value?: string | Array<string> | null;
    /**
     * The second argument carries the labelInValue pair(s), so a caller can
     * show the email while the raw UUID goes into a filter or mutation input.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    /** The users this scope reaches are listed, usually the current domain (ADR 0012). */
    scope: UserScope;
    filter?: BAIScopedUserSelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIScopedUserSelectRef>;
}
declare const BAIScopedUserSelect: React.FC<BAIScopedUserSelectProps>;
export default BAIScopedUserSelect;
