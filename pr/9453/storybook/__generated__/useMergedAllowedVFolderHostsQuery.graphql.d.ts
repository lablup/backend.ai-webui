import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedVFolderHostsQuery$variables = {
    domainName: string;
    keypairResourcePolicyName?: string | null | undefined;
    projectId: string;
    skipProject: boolean;
};
export type useMergedAllowedVFolderHostsQuery$data = {
    readonly domain: {
        readonly allowed_vfolder_hosts: string | null | undefined;
    } | null | undefined;
    readonly group?: {
        readonly allowed_vfolder_hosts: string | null | undefined;
    } | null | undefined;
    readonly keypair_resource_policy: {
        readonly allowed_vfolder_hosts: string | null | undefined;
    } | null | undefined;
};
export type useMergedAllowedVFolderHostsQuery = {
    response: useMergedAllowedVFolderHostsQuery$data;
    variables: useMergedAllowedVFolderHostsQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
