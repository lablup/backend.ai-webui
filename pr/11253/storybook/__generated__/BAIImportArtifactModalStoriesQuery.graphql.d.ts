import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIImportArtifactModalStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIImportArtifactModalStoriesQuery$data = {
    readonly artifactRevisions: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactRevisionFragment">;
            };
        }>;
    } | null | undefined;
    readonly artifacts: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIImportArtifactModalArtifactFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIImportArtifactModalStoriesQuery = {
    response: BAIImportArtifactModalStoriesQuery$data;
    variables: BAIImportArtifactModalStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
