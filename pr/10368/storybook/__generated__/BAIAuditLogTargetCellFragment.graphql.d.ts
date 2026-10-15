import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type AuditLogActionKind = "BULK" | "GLOBAL" | "LOOKUP" | "MEMBERSHIP" | "RELATION" | "SCOPE" | "SINGLE_ENTITY" | "%future added value";
export type BAIAuditLogTargetCellFragment$data = {
    readonly actionId: string;
    readonly actionKind: AuditLogActionKind | null | undefined;
    readonly entity: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
    } | null | undefined;
    readonly entityType: string | null | undefined;
    readonly lookupKey: string | null | undefined;
    readonly lookupKind: string | null | undefined;
    readonly scopes: {
        readonly count: number;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly entity: {
                    readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
                } | null | undefined;
                readonly id: string;
                readonly scopeId: string;
                readonly scopeType: string;
            };
        }>;
    };
    readonly targetEntityId: string | null | undefined;
    readonly " $fragmentType": "BAIAuditLogTargetCellFragment";
};
export type BAIAuditLogTargetCellFragment$key = {
    readonly " $data"?: BAIAuditLogTargetCellFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellFragment">;
};
declare const node: ReaderFragment;
export default node;
