import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type BAIKeypairResourcePolicyV2TableFragment$data = ReadonlyArray<{
    readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
    }>;
    readonly createdAt: string | null | undefined;
    readonly defaultForUnspecified: string;
    readonly id: string;
    readonly idleTimeout: number;
    readonly maxConcurrentSessions: number;
    readonly maxConcurrentSftpSessions: number;
    readonly maxContainersPerSession: number;
    readonly maxPendingSessionCount: number | null | undefined;
    readonly maxPendingSessionResourceSlots: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
    }> | null | undefined;
    readonly maxSessionLifetime: number;
    readonly name: string;
    readonly totalResourceSlots: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
    }>;
    readonly " $fragmentType": "BAIKeypairResourcePolicyV2TableFragment";
}>;
export type BAIKeypairResourcePolicyV2TableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIKeypairResourcePolicyV2TableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIKeypairResourcePolicyV2TableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
