import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
export type BAIAdminRetentionPolicyTableFragment$data = ReadonlyArray<{
    readonly category: RetentionCategory;
    readonly createdAt: string;
    readonly enabled: boolean;
    readonly entityId: string;
    readonly id: string;
    readonly lastSweptAt: string | null | undefined;
    readonly retentionPeriodDays: number;
    readonly updatedAt: string;
    readonly " $fragmentType": "BAIAdminRetentionPolicyTableFragment";
}>;
export type BAIAdminRetentionPolicyTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIAdminRetentionPolicyTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAdminRetentionPolicyTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
