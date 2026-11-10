import { BAIVFolderNodeSelectPaginatedQuery } from '../../__generated__/BAIVFolderNodeSelectPaginatedQuery.graphql';
import { BAIComplexSelectProps, BAILabeledValue } from '../BAIComplexSelect';
export type VFolderNode = NonNullable<NonNullable<BAIVFolderNodeSelectPaginatedQuery['response']['vfolder_nodes']>['edges'][number]>['node'];
export interface BAIVFolderNodeSelectRef {
    refetch: () => void;
}
/** Permission names accepted by the `permission` argument of `vfolder_nodes`. */
export type BAIVFolderPermission = 'clone' | 'assign_permission_to_others' | 'read_attribute' | 'update_attribute' | 'delete_vfolder' | 'read_content' | 'write_content' | 'delete_content' | 'mount_ro' | 'mount_rw' | 'mount_wd';
export interface BAIVFolderNodeSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    value?: string | Array<string> | null;
    /** The second argument is the picked option, so a `renderInput` filter can
     * label its token with the folder name while the id serializes. */
    onChange?: (value: string | Array<string> | undefined, option?: BAILabeledValue | Array<BAILabeledValue>) => void;
    currentProjectId?: string;
    filter?: string;
    valuePropName?: 'id' | 'row_id';
    excludeDeleted?: boolean;
    /**
     * Lists only the folders granting this permission to the current user.
     * Defaults to `'read_attribute'`; one value only, as the API argument is a
     * single scalar.
     */
    requiredPermission?: BAIVFolderPermission;
    onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
    /**
     * Caller-known labels (keyed by the outer value) for values this select's
     * own value query cannot resolve — e.g. a prefilled folder outside the
     * current scope/filter. Used only when resolution misses; a resolved name
     * always wins.
     */
    fallbackLabels?: Record<string, string>;
    ref?: React.Ref<BAIVFolderNodeSelectRef>;
}
declare const BAIVFolderNodeSelect: React.FC<BAIVFolderNodeSelectProps>;
export default BAIVFolderNodeSelect;
