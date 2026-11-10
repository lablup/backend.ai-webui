import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactRevisionDownloadButtonStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionDownloadButtonStoriesQuery$data = {
    readonly artifactRevisions: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionDownloadButtonFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIArtifactRevisionDownloadButtonStoriesQuery = {
    response: BAIArtifactRevisionDownloadButtonStoriesQuery$data;
    variables: BAIArtifactRevisionDownloadButtonStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
