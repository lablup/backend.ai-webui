import { BAIProjectVfolderSelectPaginatedQuery } from '../../__generated__/BAIProjectVfolderSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type ProjectVfolderNode = NonNullable<NonNullable<BAIProjectVfolderSelectPaginatedQuery['response']['projectVfolders']>['edges'][number]>['node'];
export type BAIProjectVfolderSelectFilter = NonNullable<BAIProjectVfolderSelectPaginatedQuery['variables']['filter']>;
export interface BAIProjectVfolderSelectRef {
    refetch: () => void;
}
export interface BAIProjectVfolderSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key, as the antd `BAIProjectVfolderSelect` exposes. */
    value?: string | null;
    onChange?: (value: string | undefined) => void;
    projectId: string;
    filter?: BAIProjectVfolderSelectFilter | null;
    excludeDeleted?: boolean;
    ref?: React.Ref<BAIProjectVfolderSelectRef>;
}
declare const BAIProjectVfolderSelect: React.FC<BAIProjectVfolderSelectProps>;
export default BAIProjectVfolderSelect;
