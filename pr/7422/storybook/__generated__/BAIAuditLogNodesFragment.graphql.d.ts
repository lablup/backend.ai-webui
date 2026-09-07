import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type AuditLogStatus = "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
export type BAIAuditLogNodesFragment$data = ReadonlyArray<{
    readonly actionId: string;
    readonly createdAt: string;
    readonly description: string;
    readonly duration: string | null | undefined;
    readonly entityId: string | null | undefined;
    readonly entityType: string;
    readonly id: string;
    readonly operation: string;
    readonly requestId: string | null | undefined;
    readonly status: AuditLogStatus;
    readonly triggeredBy: string | null | undefined;
    readonly user: {
        readonly basicInfo: {
            readonly email: string;
        };
        readonly id: string;
    } | null | undefined;
    readonly " $fragmentType": "BAIAuditLogNodesFragment";
}>;
export type BAIAuditLogNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIAuditLogNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
