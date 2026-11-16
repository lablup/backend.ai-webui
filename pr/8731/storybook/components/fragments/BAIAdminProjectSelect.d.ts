import { BAIAdminProjectSelectPaginatedQuery } from '../../__generated__/BAIAdminProjectSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type AstryxAdminProjectNode = NonNullable<NonNullable<BAIAdminProjectSelectPaginatedQuery['response']['adminProjectsV2']>['edges'][number]>['node'];
export interface BAIAdminProjectSelectRef {
    refetch: () => void;
}
export interface BAIAdminProjectSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminProjectSelect` exposes. */
    value?: string | Array<string> | null;
    /**
     * P3C-1: like `BAIUserSelect`, this wrapper keeps antd's second
     * `option` argument because it is used inside
     * `BAIGraphQLPropertyFilter.renderInput`, where the filter chip must show
     * the project NAME while the raw UUID goes into the GraphQL filter.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    filter?: {
        type?: {
            equals?: 'GENERAL' | 'MODEL_STORE';
        };
    };
    ref?: React.Ref<BAIAdminProjectSelectRef>;
}
declare const BAIAdminProjectSelect: React.FC<BAIAdminProjectSelectProps>;
export default BAIAdminProjectSelect;
