import { BAIObjectStorageSelectQuery } from '../../__generated__/BAIObjectStorageSelectQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxObjectStorageNode = NonNullable<NonNullable<BAIObjectStorageSelectQuery['response']['objectStorages']>['edges'][number]>['node'];
export interface BAIObjectStorageSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total' | 'multiple'> {
    /** Plain key, as the antd `BAIObjectStorageSelect` exposes. */
    value?: string | null;
    onChange?: (value: string | undefined) => void;
    fetchKey?: string;
}
declare const BAIObjectStorageSelect: React.FC<BAIObjectStorageSelectProps>;
export default BAIObjectStorageSelect;
