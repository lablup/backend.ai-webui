import { BAIVFolderSelectPaginatedQuery$data, VFolderFilter, VFolderScope } from '../../__generated__/BAIVFolderSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type VFolderSelectNode = NonNullable<BAIVFolderSelectPaginatedQuery$data['scopedVFoldersV2']>['edges'][number]['node'];
export interface BAIVFolderSelectRef {
    refetch: () => void;
}
export interface BAIVFolderSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    value?: string | Array<string> | null;
    /** The second argument is the picked option, so a `renderInput` filter can
     * label its token with the folder name while the id serializes. */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    /** The scopes whose folders are listed, combined with OR (ADR 0012). */
    scope: VFolderScope;
    /** ANDed onto the options and onto the selected-value lookup. */
    filter?: VFolderFilter;
    /** `'id'` keys by the `VirtualFolderNode` global id the call sites store; `'entityId'` by the UUID. */
    valuePropName?: 'id' | 'entityId';
    excludeDeleted?: boolean;
    /** Labels, keyed by the outer value, for selected folders the scope and filter do not reach. */
    fallbackLabels?: Record<string, string>;
    ref?: React.Ref<BAIVFolderSelectRef>;
}
declare const BAIVFolderSelect: React.FC<BAIVFolderSelectProps>;
export default BAIVFolderSelect;
