import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactRevisionDeleteButtonStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionDeleteButtonStoriesQuery$data = {
    readonly artifactRevisions: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDeleteButtonFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIArtifactRevisionDeleteButtonStoriesQuery = {
    response: BAIArtifactRevisionDeleteButtonStoriesQuery$data;
    variables: BAIArtifactRevisionDeleteButtonStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
