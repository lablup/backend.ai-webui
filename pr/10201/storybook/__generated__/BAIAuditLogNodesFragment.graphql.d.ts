import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type AuditLogActionKind = "BULK" | "GLOBAL" | "LOOKUP" | "MEMBERSHIP" | "RELATION" | "SCOPE" | "SINGLE_ENTITY" | "%future added value";
export type AuditLogStatus = "DENIED" | "ERROR" | "RUNNING" | "SUCCESS" | "UNKNOWN" | "%future added value";
export type BAIAuditLogNodesFragment$data = ReadonlyArray<{
    readonly actionId: string;
    readonly actionKind: AuditLogActionKind | null | undefined;
    readonly actionName: string;
    readonly clientIp: string | null | undefined;
    readonly createdAt: string;
    readonly description: string;
    readonly duration: string | null | undefined;
    readonly entityId: string | null | undefined;
    readonly entityType: string | null | undefined;
    readonly id: string;
    readonly lookupKey: string | null | undefined;
    readonly lookupKind: string | null | undefined;
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
