import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
export type BAILoginHistoryTableFragment$data = ReadonlyArray<{
    readonly createdAt: string;
    readonly domainName: string;
    readonly failReason: string | null | undefined;
    readonly id: string;
    readonly result: LoginAttemptResult;
    readonly " $fragmentType": "BAILoginHistoryTableFragment";
}>;
export type BAILoginHistoryTableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAILoginHistoryTableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAILoginHistoryTableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
