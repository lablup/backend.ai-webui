import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectValueQuery$variables = {
    first: number;
    selectedFilter?: string | null | undefined;
    skipSelected: boolean;
};
export type BAIUserSelectValueQuery$data = {
    readonly user_nodes?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly email: string | null | undefined;
                readonly id: string;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIUserSelectValueQuery = {
    response: BAIUserSelectValueQuery$data;
    variables: BAIUserSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
