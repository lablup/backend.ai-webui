import { BAIAdminUserV2SelectPaginatedQuery } from '../../__generated__/BAIAdminUserV2SelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type BAIAdminUserV2SelectFilter = NonNullable<BAIAdminUserV2SelectPaginatedQuery['variables']['filter']>;
export type AstryxAdminUserV2Node = NonNullable<NonNullable<BAIAdminUserV2SelectPaginatedQuery['response']['adminUsersV2']>['edges'][number]>['node'];
export interface BAIAdminUserV2SelectRef {
    refetch: () => void;
}
export interface BAIAdminUserV2SelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
    value?: string | Array<string> | null;
    /**
     * P3C-1: the second `option` argument carries the labelInValue pair(s), so a
     * caller can show the email while the raw UUID goes into a mutation input.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    filter?: BAIAdminUserV2SelectFilter;
    excludeInactive?: boolean;
    valuePropName?: 'id' | 'email';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminUserV2SelectRef>;
}
declare const BAIAdminUserV2Select: React.FC<BAIAdminUserV2SelectProps>;
export default BAIAdminUserV2Select;
