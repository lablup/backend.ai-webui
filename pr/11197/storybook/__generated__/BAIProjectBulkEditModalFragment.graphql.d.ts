import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIProjectBulkEditModalFragment$data = ReadonlyArray<{
    readonly name: string | null | undefined;
    readonly row_id: string | null | undefined;
    readonly " $fragmentType": "BAIProjectBulkEditModalFragment";
}>;
export type BAIProjectBulkEditModalFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIProjectBulkEditModalFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIProjectBulkEditModalFragment">;
}>;
declare const node: ReaderFragment;
export default node;
