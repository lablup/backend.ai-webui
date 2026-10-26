import { BAIComplexSelectProps } from '../BAIComplexSelect';
export interface BAIBucketSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    objectStorageId: string;
    fetchKey?: string;
    /** Plain key(s), as the antd `BAIBucketSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
}
declare const BAIBucketSelect: React.FC<BAIBucketSelectProps>;
export default BAIBucketSelect;
