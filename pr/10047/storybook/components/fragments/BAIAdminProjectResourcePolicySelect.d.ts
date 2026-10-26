import { BAIAdminProjectResourcePolicySelectPaginatedQuery } from '../../__generated__/BAIAdminProjectResourcePolicySelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AdminProjectResourcePolicyNode = NonNullable<NonNullable<BAIAdminProjectResourcePolicySelectPaginatedQuery['response']['adminProjectResourcePoliciesV2']>['edges'][number]>['node'];
export interface BAIAdminProjectResourcePolicySelectRef {
    refetch: () => void;
}
export interface BAIAdminProjectResourcePolicySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** The policy name(s). */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminProjectResourcePolicySelectRef>;
}
declare const BAIAdminProjectResourcePolicySelect: React.FC<BAIAdminProjectResourcePolicySelectProps>;
export default BAIAdminProjectResourcePolicySelect;
