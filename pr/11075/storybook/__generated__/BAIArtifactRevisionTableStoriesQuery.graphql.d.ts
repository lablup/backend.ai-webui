import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIArtifactRevisionTableStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIArtifactRevisionTableStoriesQuery$data = {
    readonly artifact: {
        readonly latestVersion: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableLatestRevisionFragment">;
                };
            }>;
        } | null | undefined;
        readonly revisions: {
            readonly edges: ReadonlyArray<{
                readonly node: {
                    readonly " $fragmentSpreads": FragmentRefs<"BAIArtifactRevisionTableArtifactRevisionFragment">;
                };
            }>;
        } | null | undefined;
    } | null | undefined;
};
export type BAIArtifactRevisionTableStoriesQuery = {
    response: BAIArtifactRevisionTableStoriesQuery$data;
    variables: BAIArtifactRevisionTableStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
