import { BAIComplexSelectProps } from '../BAIComplexSelect';
/**
 * A folder as the REST `GET /folders` endpoint returns it. Distinct from the
 * GraphQL `vfolder_nodes` shape: `id` is the 32-hex local id (no dashes) and
 * `group` is the owning project's UUID or `null` for a user folder.
 */
export interface LegacyVFolder {
    name: string;
    id: string;
    quota_scope_id: string;
    host: string;
    status: string;
    usage_mode: string;
    created_at: string;
    is_owner: boolean;
    permission: string;
    user: string | null;
    group: string | null;
    creator: string;
    user_email: string | null;
    group_name: string | null;
    ownership_type: string;
    type: string;
    cloneable: boolean;
    max_files: number;
    max_size: null | number;
    cur_size: number;
}
export interface BAILegacyVFolderSelectProps extends Omit<BAIComplexSelectProps, 'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'> {
    /** Dashed vfolder UUID(s). A 32-hex REST id is accepted and normalized. */
    value?: string | Array<string> | null;
    defaultValue?: string | Array<string> | null;
    onChange?: (value: string | Array<string> | undefined) => void;
    /**
     * Project scope. Folders owned by another project are dropped, and the
     * project's `allowed_vfolder_hosts` join the mountable-host gate.
     */
    currentProjectId?: string;
    /** Lists the folders of this user instead of the caller's own. */
    ownerEmail?: string;
    /**
     * Display-only filter, applied after the mount gates. A folder that is
     * already selected stays visible even when it filters out — the same rule
     * VFolderTable applies to its `rowFilter`.
     */
    filter?: (folder: LegacyVFolder) => boolean;
    /** Names of the mountable, ready dotfile folders the session auto-mounts. */
    onAutoMountedFoldersChange?: (names: Array<string>) => void;
    /** key -> name for every mountable folder, so callers can label a selection. */
    onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
}
/**
 * Folder picker over the REST `GET /folders` list, gated as the session
 * launcher gates its mounts: `mount-in-session` hosts only, project-reachable
 * folders only. Value is the dashed vfolder UUID. See the `.doc.ts` beside it.
 */
declare const BAILegacyVFolderSelect: React.FC<BAILegacyVFolderSelectProps>;
export default BAILegacyVFolderSelect;
