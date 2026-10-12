import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type BAIDirectoryPickerModalQuery$variables = {
    vfolderId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
    readonly myStorageHostPermissions: {
        readonly items: ReadonlyArray<{
            readonly host: string;
            readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
        }>;
    } | null | undefined;
    readonly vfolderV2: {
        readonly host: string;
        readonly id: string;
        readonly metadata: {
            readonly name: string;
        };
        readonly permissions: ReadonlyArray<PermissionBit>;
    } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
    response: BAIDirectoryPickerModalQuery$data;
    variables: BAIDirectoryPickerModalQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
