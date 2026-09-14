import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIDeleteArtifactRevisionsModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIDeleteArtifactRevisionsModalStoriesQuery$data = {
    readonly artifactRevisions: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactRevisionFragment">;
            };
        }>;
    } | null | undefined;
    readonly artifacts: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIDeleteArtifactRevisionsModalArtifactFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIDeleteArtifactRevisionsModalStoriesQuery = {
    response: BAIDeleteArtifactRevisionsModalStoriesQuery$data;
    variables: BAIDeleteArtifactRevisionsModalStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
