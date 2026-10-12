import { BAIAdminContainerRegistrySelectPaginatedQuery } from '../../__generated__/BAIAdminContainerRegistrySelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type BAIAdminContainerRegistrySelectFilter = NonNullable<BAIAdminContainerRegistrySelectPaginatedQuery['variables']['filter']>;
export type AstryxContainerRegistryNode = NonNullable<BAIAdminContainerRegistrySelectPaginatedQuery['response']['adminContainerRegistriesV2']>['edges'][number]['node'];
export interface BAIAdminContainerRegistrySelectRef {
    refetch: () => void;
}
export interface BAIAdminContainerRegistrySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s): the registry UUID. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    /** AND-ed into the page query filter; the search term owns `registryName`. */
    filter?: BAIAdminContainerRegistrySelectFilter | null;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}
declare const BAIAdminContainerRegistrySelect: React.FC<BAIAdminContainerRegistrySelectProps>;
export default BAIAdminContainerRegistrySelect;
