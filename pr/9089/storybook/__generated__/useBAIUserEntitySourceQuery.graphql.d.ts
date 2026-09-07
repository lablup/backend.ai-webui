import { ConcreteRequest } from 'relay-runtime';
export type useBAIUserEntitySourceQuery$variables = {
    filter?: string | null | undefined;
    first: number;
};
export type useBAIUserEntitySourceQuery$data = {
    readonly user_nodes: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly email: string | null | undefined;
                readonly full_name: string | null | undefined;
                readonly id: string;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type useBAIUserEntitySourceQuery = {
    response: useBAIUserEntitySourceQuery$data;
    variables: useBAIUserEntitySourceQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
