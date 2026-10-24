import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIAgentTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIAgentTableStoriesQuery$data = {
    readonly agent_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIAgentTableFragment">;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIAgentTableStoriesQuery = {
    response: BAIAgentTableStoriesQuery$data;
    variables: BAIAgentTableStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
