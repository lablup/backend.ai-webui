import { ConcreteRequest, FragmentRefs } from 'relay-runtime';
export type BAIAuditLogTargetCellStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIAuditLogTargetCellStoriesQuery$data = {
    readonly adminAuditLogsV2: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellFragment">;
            };
        }>;
    } | null | undefined;
};
export type BAIAuditLogTargetCellStoriesQuery = {
    response: BAIAuditLogTargetCellStoriesQuery$data;
    variables: BAIAuditLogTargetCellStoriesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
