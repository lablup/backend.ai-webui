import { BAIKeypairSelectPaginatedQuery } from '../../__generated__/BAIKeypairSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxKeypairNode = NonNullable<NonNullable<BAIKeypairSelectPaginatedQuery['response']['keypair_list']>['items'][number]>;
export interface BAIKeypairSelectRef {
    refetch: () => void;
}
export interface BAIKeypairSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIKeypairSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    filter?: string;
    ref?: React.Ref<BAIKeypairSelectRef>;
}
declare const BAIKeypairSelect: React.FC<BAIKeypairSelectProps>;
export default BAIKeypairSelect;
