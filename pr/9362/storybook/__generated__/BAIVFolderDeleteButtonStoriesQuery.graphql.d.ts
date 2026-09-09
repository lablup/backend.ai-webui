import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIVFolderDeleteButtonStoriesQuery$variables = {
    permission?: any | null | undefined;
};
export type BAIVFolderDeleteButtonStoriesQuery$data = {
    readonly vfolder_nodes: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIVFolderDeleteButtonFragment">;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIVFolderDeleteButtonStoriesQuery = {
    response: BAIVFolderDeleteButtonStoriesQuery$data;
    variables: BAIVFolderDeleteButtonStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
