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
interface UseProjectResourceGroupsOptions {
    /**
     * Optional additional filter applied after SFTP scaling groups are excluded.
     * Receives the resource group (scaling group) name and should return `true`
     * to keep it in the result.
     */
    filter?: (resourceGroupName: string) => boolean;
}
/**
 * Fetches the resource groups accessible to the given project for the current
 * user, excluding SFTP-only scaling groups. Shared by
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
