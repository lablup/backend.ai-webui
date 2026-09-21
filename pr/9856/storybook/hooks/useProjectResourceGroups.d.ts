export interface ScalingGroupItem {
    name: string;
}
/**
 * Thrown when the vfolder host info fetch (`/folders/_/hosts`) inside
 * `useProjectResourceGroups` fails. Tagging the failure lets callers wrap
 * the hook with a dedicated error boundary that can distinguish this
 * specific case from unrelated render errors and surface a targeted
 * message (and discriminate it from the parallel scaling-groups fetch
 * failure, which is re-thrown as-is so an outer boundary handles it).
 */
export declare class StorageHostFetchError extends Error {
    readonly originalError: unknown;
    constructor(originalError: unknown);
}
interface VolumeInfo {
    backend: string;
    capabilities: string[];
    usage: {
        percentage: number;
    };
    sftp_scaling_groups?: string[];
}
interface StorageHostsResponse {
    allowed: string[];
    default: string;
    volume_info: {
        [key: string]: VolumeInfo;
    };
}
interface UseProjectResourceGroupsOptions {
    /**
     * Optional additional filter applied after SFTP scaling groups are excluded.
     * Receives the resource group (scaling group) name and should return `true`
     * to keep it in the result.
     */
    filter?: (resourceGroupName: string) => boolean;
    /**
     * Keep the SFTP-designated resource groups in the result. They are reserved
     * for SSH/SFTP system sessions, so every other surface leaves this off
     * (FR-3996).
     */
    includeSFTPResourceGroups?: boolean;
}
/**
 * The option list rule, kept pure so it can be exercised without a client:
 * drop the resource groups any volume has designated for SFTP, then apply the
 * caller's own filter. `includeSFTPResourceGroups` keeps the SFTP ones, for
 * the SSH/SFTP system-session surfaces they are reserved for (FR-3996).
 */
export declare const selectProjectResourceGroups: (scalingGroups: ScalingGroupItem[], volumeInfo: StorageHostsResponse["volume_info"] | undefined, options?: UseProjectResourceGroupsOptions) => ScalingGroupItem[];
/**
 * Fetches the resource groups accessible to the given project for the current
 * user, excluding SFTP-only scaling groups unless
 * `includeSFTPResourceGroups` is set. Shared by
 * `BAIProjectResourceGroupSelect` and any caller that needs to reason about
 * the available resource groups (e.g. to decide whether to show a selector or
 * auto-deploy). Both call sites use the same React Query key so a single
 * network request is made per `projectName`.
 *
 * If `projectName` is empty/falsy, the hook short-circuits and returns an
 * empty list without issuing any network request — callers that haven't yet
 * resolved the current project can pass `''` safely.
 */
export declare const useProjectResourceGroups: (projectName: string, options?: UseProjectResourceGroupsOptions) => {
    resourceGroups: ScalingGroupItem[];
};
export {};
