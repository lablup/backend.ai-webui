import { BAIScopedImageSelectPaginatedQuery, ImageSearchScope, ImageV2Filter } from '../../__generated__/BAIScopedImageSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type AstryxImageV2Node = NonNullable<NonNullable<BAIScopedImageSelectPaginatedQuery['response']['scopedImagesV2']>['edges'][number]>['node'];
export interface BAIScopedImageSelectRef {
    refetch: () => void;
}
export interface BAIScopedImageSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Plain key(s), as the antd `BAIScopedImageSelect` exposes. */
    value?: string | Array<string> | null;
    /** The second argument is the picked option, so a `renderInput` filter can
     * label its token with the image name while the UUID serializes. */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    /** Additional GraphQL filter to narrow the image list. */
    filter?: ImageV2Filter;
    open?: boolean;
    defaultOpen?: boolean;
    /** The images this scope reaches are listed (ADR 0012). */
    scope: ImageSearchScope;
    ref?: React.Ref<BAIScopedImageSelectRef>;
}
/**
 * Paginated image selector backed by `scopedImagesV2` (ImageV2) over the required `scope`.
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`.
 */
declare const BAIScopedImageSelect: React.FC<BAIScopedImageSelectProps>;
export default BAIScopedImageSelect;
