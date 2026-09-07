import { BAIAdminContainerRegistrySelectPaginatedQuery } from '../../__generated__/BAIAdminContainerRegistrySelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxContainerRegistryNode = NonNullable<NonNullable<BAIAdminContainerRegistrySelectPaginatedQuery['response']['container_registry_nodes']>['edges'][number]>['node'];
export interface BAIAdminContainerRegistrySelectRef {
    refetch: () => void;
}
export interface BAIAdminContainerRegistrySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminContainerRegistrySelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    filter?: string;
    valuePropName?: 'id' | 'row_id';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}
declare const BAIAdminContainerRegistrySelect: React.FC<BAIAdminContainerRegistrySelectProps>;
export default BAIAdminContainerRegistrySelect;
