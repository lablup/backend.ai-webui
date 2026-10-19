import { BAIScopedProjectSelectPaginatedQuery, ProjectScope } from '../../__generated__/BAIScopedProjectSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type ScopedProjectNode = NonNullable<NonNullable<BAIScopedProjectSelectPaginatedQuery['response']['scopedProjectsV2']>['edges'][number]>['node'];
export interface BAIScopedProjectSelectRef {
    refetch: () => void;
}
export interface BAIScopedProjectSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIScopedProjectSelect` exposes. */
    value?: string | Array<string> | null;
    /**
     * P3C-1: like `BAIUserSelect`, this wrapper keeps antd's second
     * `option` argument because it is used inside
     * `BAIGraphQLPropertyFilter.renderInput`, where the filter chip must show
     * the project NAME while the raw UUID goes into the GraphQL filter.
     */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    /** Spread into the page query filter; the search term owns `name`. */
    filter?: Omit<NonNullable<BAIScopedProjectSelectPaginatedQuery['variables']['filter']>, 'name'>;
    /** The projects this scope reaches are listed, usually the current domain (ADR 0012). */
    scope: ProjectScope;
    ref?: React.Ref<BAIScopedProjectSelectRef>;
}
declare const BAIScopedProjectSelect: React.FC<BAIScopedProjectSelectProps>;
export default BAIScopedProjectSelect;
