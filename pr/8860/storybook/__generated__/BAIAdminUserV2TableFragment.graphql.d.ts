import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type UserStatusV2 = "ACTIVE" | "BEFORE_VERIFICATION" | "DELETED" | "INACTIVE" | "%future added value";
export type BAIAdminUserV2TableFragment$data = ReadonlyArray<{
    readonly basicInfo: {
        readonly description: string | null | undefined;
        readonly email: string;
        readonly fullName: string | null | undefined;
        readonly integrationName: string | null | undefined;
        readonly username: string | null | undefined;
    };
    readonly container: {
        readonly containerGids: ReadonlyArray<number> | null | undefined;
        readonly containerMainGid: number | null | undefined;
        readonly containerUid: number | null | undefined;
    };
    readonly id: string;
    readonly organization: {
        readonly domainName: string | null | undefined;
        readonly mainAccessKey: string | null | undefined;
        readonly resourcePolicy: string;
        readonly role: UserRoleV2 | null | undefined;
    };
    readonly security: {
        readonly allowedClientIp: ReadonlyArray<string> | null | undefined;
        readonly sudoSessionEnabled: boolean;
        readonly totpActivated?: boolean | null | undefined;
        readonly totpActivatedAt?: string | null | undefined;
    };
    readonly status: {
        readonly needPasswordChange: boolean | null | undefined;
        readonly status: UserStatusV2;
        readonly statusInfo: string | null | undefined;
    };
    readonly timestamps: {
        readonly createdAt: string | null | undefined;
        readonly modifiedAt: string | null | undefined;
    };
    readonly " $fragmentType": "BAIAdminUserV2TableFragment";
} | null | undefined>;
export type BAIAdminUserV2TableFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIAdminUserV2TableFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAdminUserV2TableFragment">;
}>;
declare const node: ReaderFragment;
export default node;
