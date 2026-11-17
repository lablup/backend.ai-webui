import { ConcreteRequest } from 'relay-runtime';
export type BAIKeypairSelectValueQuery$variables = {
    filter?: string | null | undefined;
    limit: number;
    offset: number;
    skipSelected: boolean;
};
export type BAIKeypairSelectValueQuery$data = {
    readonly keypair_list?: {
        readonly items: ReadonlyArray<{
            readonly access_key: string | null | undefined;
            readonly is_active: boolean | null | undefined;
            readonly user_id: string | null | undefined;
        } | null | undefined>;
        readonly total_count: number;
    } | null | undefined;
};
export type BAIKeypairSelectValueQuery = {
    response: BAIKeypairSelectValueQuery$data;
    variables: BAIKeypairSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
