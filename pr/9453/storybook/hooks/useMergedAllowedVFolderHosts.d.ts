export interface UseMergedAllowedVFolderHostsArgs {
    domainName: string;
    /** Omit or pass `null` to merge only the domain and keypair policies. */
    projectId?: string | null;
}
export interface MergedAllowedVFolderHosts {
    /** Host name -> the permission keys merged across the three policies. */
    permissionsByHost: Record<string, Array<string>>;
    /** The subset of hosts granting `mount-in-session`. */
    mountableHosts: Array<string>;
}
/**
 * Merge the `allowed_vfolder_hosts` of the domain, the (optional) project and
 * the caller's keypair resource policy into one host -> permissions record.
 * Suspends on the query.
 */
export declare const useMergedAllowedVFolderHosts: ({ domainName, projectId, }: UseMergedAllowedVFolderHostsArgs) => MergedAllowedVFolderHosts;
export default useMergedAllowedVFolderHosts;
