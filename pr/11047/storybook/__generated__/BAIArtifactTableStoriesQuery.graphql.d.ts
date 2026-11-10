import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactTableStoriesQuery$data = {
    readonly artifacts: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactTableArtifactFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIArtifactTableStoriesQuery = {
    response: BAIArtifactTableStoriesQuery$data;
    variables: BAIArtifactTableStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
