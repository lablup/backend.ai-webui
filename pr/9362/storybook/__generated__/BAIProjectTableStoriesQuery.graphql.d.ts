import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIProjectTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIProjectTableStoriesQuery$data = {
    readonly group_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIProjectTableFragment">;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
    readonly vfolder_host_permissions: {
        readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
    } | null | undefined;
};
export type BAIProjectTableStoriesQuery = {
    response: BAIProjectTableStoriesQuery$data;
    variables: BAIProjectTableStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
