import { BAIProjectSelectPaginatedQuery } from '../../__generated__/BAIProjectSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxProjectNode = NonNullable<NonNullable<BAIProjectSelectPaginatedQuery['response']['group_nodes']>['edges'][number]>['node'];
export interface BAIProjectSelectRef {
    refetch: () => void;
}
export interface BAIProjectSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIProjectSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    filter?: string;
    ref?: React.Ref<BAIProjectSelectRef>;
}
declare const BAIProjectSelect: React.FC<BAIProjectSelectProps>;
export default BAIProjectSelect;
