import { BAIAdminModelServiceSelectPaginatedQuery } from '../../__generated__/BAIAdminModelServiceSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxModelServiceNode = NonNullable<NonNullable<BAIAdminModelServiceSelectPaginatedQuery['response']['adminDeployments']>['edges'][number]>['node'];
export interface BAIAdminModelServiceSelectRef {
    refetch: () => void;
}
export interface BAIAdminModelServiceSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminModelServiceSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminModelServiceSelectRef>;
}
declare const BAIAdminModelServiceSelect: React.FC<BAIAdminModelServiceSelectProps>;
export default BAIAdminModelServiceSelect;
