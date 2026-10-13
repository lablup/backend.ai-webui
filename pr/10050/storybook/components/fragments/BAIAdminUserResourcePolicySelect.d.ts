import { BAIAdminUserResourcePolicySelectPaginatedQuery } from '../../__generated__/BAIAdminUserResourcePolicySelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AdminUserResourcePolicyNode = NonNullable<NonNullable<BAIAdminUserResourcePolicySelectPaginatedQuery['response']['adminUserResourcePoliciesV2']>['edges'][number]>['node'];
export interface BAIAdminUserResourcePolicySelectRef {
    refetch: () => void;
}
export interface BAIAdminUserResourcePolicySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** The policy name(s). */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminUserResourcePolicySelectRef>;
}
declare const BAIAdminUserResourcePolicySelect: React.FC<BAIAdminUserResourcePolicySelectProps>;
export default BAIAdminUserResourcePolicySelect;
