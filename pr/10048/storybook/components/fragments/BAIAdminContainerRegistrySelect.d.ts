import { BAIComplexSelectProps } from '../BAIComplexSelect';
/** One registry, normalized across the V2 and the legacy node shapes. */
export interface AstryxContainerRegistryNode {
    id: string;
    rowId: string;
    registryName: string;
    project: string | null;
}
export interface BAIAdminContainerRegistrySelectRef {
    refetch: () => void;
}
export interface BAIAdminContainerRegistrySelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s): the global `id`, or the registry UUID in `row_id` mode. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    valuePropName?: 'id' | 'row_id';
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}
declare const BAIAdminContainerRegistrySelect: React.FC<BAIAdminContainerRegistrySelectProps>;
export default BAIAdminContainerRegistrySelect;
