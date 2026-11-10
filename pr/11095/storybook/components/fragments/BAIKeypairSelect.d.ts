import { BAIKeypairSelectPaginatedQuery, KeypairFilter } from '../../__generated__/BAIKeypairSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxKeypairNode = NonNullable<BAIKeypairSelectPaginatedQuery['response']['adminKeypairsV2']>['edges'][number]['node'];
export interface BAIKeypairSelectRef {
    refetch: () => void;
}
export interface BAIKeypairSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIKeypairSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    filter?: KeypairFilter;
    ref?: React.Ref<BAIKeypairSelectRef>;
}
declare const BAIKeypairSelect: React.FC<BAIKeypairSelectProps>;
export default BAIKeypairSelect;
