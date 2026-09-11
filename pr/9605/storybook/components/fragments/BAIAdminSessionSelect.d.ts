import { BAIAdminSessionSelectPaginatedQuery } from '../../__generated__/BAIAdminSessionSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxAdminSessionNode = NonNullable<NonNullable<BAIAdminSessionSelectPaginatedQuery['response']['adminSessionsV2']>['edges'][number]>['node'];
export interface BAIAdminSessionSelectRef {
    refetch: () => void;
}
export interface BAIAdminSessionSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminSessionSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    ref?: React.Ref<BAIAdminSessionSelectRef>;
}
declare const BAIAdminSessionSelect: React.FC<BAIAdminSessionSelectProps>;
export default BAIAdminSessionSelect;
