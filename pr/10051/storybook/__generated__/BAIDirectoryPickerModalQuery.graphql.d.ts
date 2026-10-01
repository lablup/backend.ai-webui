import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type BAIDirectoryPickerModalQuery$variables = {
    supportsPermissionBits: boolean;
    vfolderGlobalId: string;
    vfolderId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
    readonly legacyVFolderNode?: {
        readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
    } | null | undefined;
    readonly vfolderV2: {
        readonly id: string;
        readonly metadata: {
            readonly name: string;
        };
        readonly permissions?: ReadonlyArray<PermissionBit>;
    } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
    response: BAIDirectoryPickerModalQuery$data;
    variables: BAIDirectoryPickerModalQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
