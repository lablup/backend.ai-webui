import { ReaderFragment, FragmentRefs } from 'relay-runtime';
export type BAIUserNodesFragment$data = ReadonlyArray<{
    readonly allowed_client_ip: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly container_gids: ReadonlyArray<number | null | undefined> | null | undefined;
    readonly container_main_gid: number | null | undefined;
    readonly container_uid: number | null | undefined;
    readonly created_at: string | null | undefined;
    readonly description: string | null | undefined;
    readonly domain_name: string | null | undefined;
    readonly email: string;
    readonly full_name: string | null | undefined;
    readonly id: string;
    readonly modified_at: string | null | undefined;
    readonly need_password_change: boolean | null | undefined;
    readonly project_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
    readonly resource_policy: string | null | undefined;
    readonly role: string | null | undefined;
    readonly status: string | null | undefined;
    readonly status_info: string | null | undefined;
    readonly sudo_session_enabled: boolean | null | undefined;
    readonly totp_activated: boolean | null | undefined;
    readonly username: string | null | undefined;
    readonly " $fragmentType": "BAIUserNodesFragment";
} | null | undefined>;
export type BAIUserNodesFragment$key = ReadonlyArray<{
    readonly " $data"?: BAIUserNodesFragment$data;
    readonly " $fragmentSpreads": FragmentRefs<"BAIUserNodesFragment">;
}>;
declare const node: ReaderFragment;
export default node;
