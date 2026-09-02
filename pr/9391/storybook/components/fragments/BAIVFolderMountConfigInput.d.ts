import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
/**
 * A single vfolder mount configuration emitted by BAIVFolderMountConfigInput.
 *
 * - `vfolderId` is the vfolder's **UUID** (`row_id`), so consumers can forward
 *   it to mount mutation inputs without further conversion.
 * - `subpath` is the mount **source**: which subfolder inside the vfolder to
 *   mount. Empty means the vfolder root.
 * - `mountDestination` is the **raw alias** the user typed, stored verbatim so
 *   the input box never transforms text mid-edit: `''` mounts at the default
 *   `${aliasBasePath}${name}`, a relative segment like `data` resolves to
 *   `${aliasBasePath}data`, and an absolute path like `/data` is used as-is.
 *   Resolve it to the full container path with {@link inputToMountDestination}.
 */
export interface VFolderMountConfigValue {
    vfolderId: string;
    name?: string;
    mountDestination?: string;
    subpath?: string;
}
export interface BAIVFolderMountConfigInputProps {
    value?: VFolderMountConfigValue[];
    defaultValue?: VFolderMountConfigValue[];
    onChange?: (value: VFolderMountConfigValue[]) => void;
    currentProjectId?: string;
    filter?: string;
    disabled?: boolean;
    /** Base path prepended to a relative alias input (mirrors VFolderTable). */
    aliasBasePath?: string;
    /**
     * Names of folders that are auto-mounted (dotfile folders). Their default
     * mount paths (`${aliasBasePath}${name}`) are added to the overlap set so a
     * user alias colliding with an auto-mounted folder is flagged — mirrors
     * VFolderTable's `FolderAliasOverlappingToAutoMount` check. Also shown as a
     * read-only tag list at the bottom of the component.
     */
    autoMountedFolderNames?: string[];
}
export declare const vFolderAliasNameRegExp: RegExp;
/**
 * Convert a user-entered alias input into the resolved mount destination,
 * following the same rule as VFolderTable's `inputToAliasPath`:
 * - empty input        -> `${basePath}${name}`
 * - input starting `/` -> used as-is (absolute path)
 * - otherwise          -> `${basePath}${input}` (relative to the base path)
 */
export declare const inputToMountDestination: (name: string, input: string | undefined, basePath: string) => string;
export interface VFolderMountConfigStatusOptions {
    /** Base path prepended to a relative alias input (mirrors VFolderTable). */
    aliasBasePath?: string;
    /** Names of auto-mounted folders, included in the overlap check. */
    autoMountedFolderNames?: string[];
}
export interface VFolderMountConfigEntryStatus {
    /** The resolved absolute mount path for the entry (for display). */
    mountDestination: string;
    /** Alias error, if any: a bad path format or a colliding mount path. */
    aliasError?: 'invalidFormat' | 'overlapping';
    /** Set when the subpath is absolute or escapes the vfolder via `..`. */
    subpathError?: boolean;
}
/**
 * Compute, per entry, its resolved mount destination and any alias/subpath
 * error — the single source of truth behind the component's inline feedback.
 * Exported so a consumer can gate a form on validity (see
 * {@link isVFolderMountConfigValid}) or translate the error kinds itself.
 */
export declare const getVFolderMountConfigStatuses: (value: VFolderMountConfigValue[] | undefined, options?: VFolderMountConfigStatusOptions) => Record<string, VFolderMountConfigEntryStatus>;
/** True when every entry's alias and subpath are valid. */
export declare const isVFolderMountConfigValid: (value: VFolderMountConfigValue[] | undefined, options?: VFolderMountConfigStatusOptions) => boolean;
/**
 * Reusable, schema-agnostic input for configuring vfolder mounts.
 *
 * Users pick vfolders with {@link BAIVFolderSelect} (in `row_id` mode, so the
 * value is the vfolder UUID); each selected folder appears as a row below the
 * select where its mount destination (alias) and an optional subpath can be
 * edited. The alias input follows VFolderTable's rule (relative inputs are
 * prefixed with `aliasBasePath`, absolute inputs are used as-is); the emitted
 * `mountDestination` stores that raw alias verbatim, which the consumer
 * resolves to the full path with {@link inputToMountDestination}. The component
 * is controlled and emits a single `VFolderMountConfigValue[]` value.
 *
 * The inline per-row errors are advisory UX only. To gate a form on validity,
 * wrap the component in one named `Form.Item` and call
 * {@link isVFolderMountConfigValid} from a `rules` validator so
 * `form.validateFields()` rejects on invalid input:
 *
 * ```tsx
 * <Form.Item
 *   name="mounts"
 *   rules={[
 *     {
 *       validator: (_rule, value) =>
 *         isVFolderMountConfigValid(value, { aliasBasePath, autoMountedFolderNames })
 *           ? Promise.resolve()
 *           : Promise.reject(new Error(t('...'))),
 *     },
 *   ]}
 * >
 *   <BAIVFolderMountConfigInput autoMountedFolderNames={...} />
 * </Form.Item>
 * ```
 */
declare const BAIVFolderMountConfigInput: React.FC<BAIVFolderMountConfigInputProps>;
export default BAIVFolderMountConfigInput;
