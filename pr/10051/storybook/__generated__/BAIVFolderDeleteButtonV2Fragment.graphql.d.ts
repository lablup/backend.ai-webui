import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type BAIVFolderDeleteButtonV2Fragment$data = ReadonlyArray<{
    readonly id: string;
    readonly permissions: ReadonlyArray<PermissionBit>;
    readonly " $fragmentType": "BAIVFolderDeleteButtonV2Fragment";
}>;
export type BAIVFolderDeleteButtonV2Fragment$key = ReadonlyArray<{
    readonly " $data"?: BAIVFolderDeleteButtonV2Fragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonV2Fragment">;
}>;
declare const node: ReaderFragment;
export default node;
