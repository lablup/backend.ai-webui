import { BAIAdminKeypairResourcePolicySelectPaginatedQuery } from '../../__generated__/BAIAdminKeypairResourcePolicySelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxAdminKeypairResourcePolicyNode = NonNullable<NonNullable<BAIAdminKeypairResourcePolicySelectPaginatedQuery['response']['adminKeypairResourcePoliciesV2']>['edges'][number]>['node'];
export interface BAIAdminKeypairResourcePolicySelectRef {
    refetch: () => void;
}
export interface BAIAdminKeypairResourcePolicySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminKeypairResourcePolicySelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminKeypairResourcePolicySelectRef>;
}
declare const BAIAdminKeypairResourcePolicySelect: React.FC<BAIAdminKeypairResourcePolicySelectProps>;
export default BAIAdminKeypairResourcePolicySelect;
