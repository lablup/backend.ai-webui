import { BAIStorageHostSelectPaginatedQuery } from '../../__generated__/BAIStorageHostSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type StorageHostNode = NonNullable<NonNullable<BAIStorageHostSelectPaginatedQuery['response']['storage_volume_list']>['items'][number]>;
export interface BAIStorageHostSelectRef {
    refetch: () => void;
}
export interface BAIStorageHostSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIStorageHostSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    filter?: string;
    ref?: React.Ref<BAIStorageHostSelectRef>;
}
declare const BAIStorageHostSelect: React.FC<BAIStorageHostSelectProps>;
export default BAIStorageHostSelect;
