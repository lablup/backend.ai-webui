import { RuleObject } from '../../form-engine';
import { LegacyVFolder } from '../../hooks/useSuspendedLegacyVFolders';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
import { LinkProps } from 'react-router-dom';
export type { LegacyVFolder };
/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 * `mountDestination` holds the **raw alias** the user typed, verbatim, so the
 * input box never transforms text mid-edit; resolve it to the full container
 * path with {@link inputToMountDestination}.
 */
export interface VFolderMountConfigValue {
    vfolderId: string;
    /**
     * The folder name. Optional for legacy values, but a producer should set it:
     * an empty alias resolves to `${aliasBasePath}${name}`, so without it the
     * mount path falls back to the raw id.
     */
    name?: string;
    mountDestination?: string;
    subpath?: string;
}
/** A folder the session mounts on its own, identified so it can be linked. */
export interface AutoMountedFolder {
    vfolderId: string;
    name: string;
}
export interface BAIVFolderMountConfigInputRef {
    /** Re-runs the `GET /folders` query behind the folder select. */
    refetch: () => Promise<unknown>;
}
export interface BAIVFolderMountConfigInputProps {
    value?: VFolderMountConfigValue[];
    defaultValue?: VFolderMountConfigValue[];
    onChange?: (value: VFolderMountConfigValue[]) => void;
    currentProjectId?: string;
    /** Lists the folders of this user instead of the caller's own. */
    ownerEmail?: string;
    /**
     * Hosts granting `mount-in-session`. Which policies merge into that list
     * is the host app's business, so it is supplied rather than queried here.
     */
    mountableHosts: string[];
    /**
     * Display-only folder filter, applied after the mount gates. An already
     * selected folder stays visible even when it filters out.
     */
    filter?: (folder: LegacyVFolder) => boolean;
    disabled?: boolean;
    /** Base path prepended to a relative alias input (mirrors VFolderTable). */
    aliasBasePath?: string;
    /**
     * Folders that are auto-mounted. Their default mount paths
     * (`${aliasBasePath}${name}`) join the overlap set so a colliding user alias
     * is flagged, they are shown as a read-only badge list at the bottom, and
     * they are dropped from the folder options.
     */
    autoMountedFolders?: Array<AutoMountedFolder>;
    /**
     * Route that opens a folder in the host's folder explorer. Given, every
     * folder name the component renders becomes a link to it.
     */
    folderExplorerPath?: (vfolderId: string) => LinkProps['to'];
    /**
     * Opens the host's folder-creation modal. The create button is rendered only
     * when this is given, because the modal lives in the host app.
     */
    onClickCreateFolder?: () => void;
    ref?: React.Ref<BAIVFolderMountConfigInputRef>;
}
export declare const vFolderAliasNameRegExp: RegExp;
/**
 * Convert a user-entered alias input into the resolved mount destination,
 * following the same rule as VFolderTable's `inputToAliasPath`.
 */
export declare const inputToMountDestination: (name: string, input: string | undefined, basePath?: string) => string;
/**
 * Inverse of {@link inputToMountDestination}: recover the raw alias a resolved
 * mount destination came from, so a stored absolute path edits as the relative
 * segment the user would have typed.
 */
export declare const mountDestinationToInput: (name: string, mountDestination: string | undefined, basePath?: string) => string;
export interface VFolderMountConfigStatusOptions {
    /** Base path prepended to a relative alias input (mirrors VFolderTable). */
    aliasBasePath?: string;
    /** Auto-mounted folders, included in the overlap check. */
    autoMountedFolders?: ReadonlyArray<Pick<AutoMountedFolder, 'name'>>;
}
export interface VFolderMountConfigEntryStatus {
    /** The resolved absolute mount path for the entry (for display). */
    mountDestination: string;
    /** Alias error, if any: a bad path format or a colliding mount path. */
    aliasError?: 'invalidFormat' | 'overlapping' | 'overlappingWithAutoMount';
    /** Set when the subpath is absolute or escapes the vfolder via `..`. */
    subpathError?: boolean;
}
/**
 * Compute, per entry, its resolved mount destination and any alias/subpath
 * error — the single source of truth behind the component's inline feedback.
 * Exported so a consumer can gate a form on validity or translate the error
 * kinds itself.
 */
export declare const getVFolderMountConfigStatuses: (value: VFolderMountConfigValue[] | undefined, options?: VFolderMountConfigStatusOptions) => Record<string, VFolderMountConfigEntryStatus>;
/** One entry's mount as it goes to the server, alias already resolved. */
export interface ResolvedVFolderMount {
    vfolderId: string;
    name: string;
    mountDestination: string;
    /** True when the alias input was left empty, so the default path applies. */
    isDefaultAlias: boolean;
    subpath: string;
}
/** Resolve every entry's name, mount destination and subpath in one pass. */
export declare const resolveVFolderMounts: (value: VFolderMountConfigValue[] | undefined, options?: VFolderMountConfigStatusOptions) => Array<ResolvedVFolderMount>;
export interface VFolderMountCreationConfig {
    mount_ids: Array<string>;
    mount_id_map: Record<string, string>;
    mount_options?: Record<string, {
        subpath: string;
    }>;
}
/**
 * Manager `creation_config` contract (>= 26.4.4): `mount_ids` names the
 * folders, `mount_id_map[id]` their container paths, `mount_options[id].subpath`
 * the in-vfolder source subfolder.
 */
export declare const toMountCreationConfig: (value: VFolderMountConfigValue[] | undefined, options?: VFolderMountConfigStatusOptions) => VFolderMountCreationConfig;
/**
 * A `Form.Item` `rules` entry gating the launch on the mount configuration,
 * rejecting with the most specific of the alias / subpath messages.
 */
export declare const useVFolderMountConfigFormRule: (options?: VFolderMountConfigStatusOptions) => RuleObject;
/**
 * Reusable, schema-agnostic input for configuring vfolder mounts.
 *
 * The folder list comes from REST `GET /folders` rather than the
 * `vfolder_nodes` connection because the `mountableHosts` /
 * `autoMountedFolders` gates the host supplies cannot be expressed there.
 * The component suspends on that fetch, so the consumer owns the Suspense
 * boundary.
 *
 * Props, form gating and usage: `BAIVFolderMountConfigInput.doc.ts`.
 */
declare const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps>;
export default BAIVFolderMountConfigInput;
