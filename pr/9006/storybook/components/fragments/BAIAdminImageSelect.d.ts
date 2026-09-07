import { BAIAdminImageSelectPaginatedQuery, ImageV2Filter } from '../../__generated__/BAIAdminImageSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps } from '../BAIComplexSelect';
export type AstryxImageV2Node = NonNullable<NonNullable<BAIAdminImageSelectPaginatedQuery['response']['adminImagesV2']>['edges'][number]>['node'];
export interface BAIAdminImageSelectRef {
    refetch: () => void;
}
export interface BAIAdminImageSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIAdminImageSelect` exposes. */
    value?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    /** Additional GraphQL filter to narrow the image list. */
    filter?: ImageV2Filter;
    open?: boolean;
    defaultOpen?: boolean;
    ref?: React.Ref<BAIAdminImageSelectRef>;
}
/**
 * Paginated image selector backed by `adminImagesV2` (ImageV2).
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`.
 */
declare const BAIAdminImageSelect: React.FC<BAIAdminImageSelectProps>;
export default BAIAdminImageSelect;
