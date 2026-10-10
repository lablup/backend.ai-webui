import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSelectValueQuery$variables = {
    first: number;
    selectedFilter?: string | null | undefined;
    skipSelected: boolean;
};
export type BAIProjectSelectValueQuery$data = {
    readonly group_nodes?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type BAIProjectSelectValueQuery = {
    response: BAIProjectSelectValueQuery$data;
    variables: BAIProjectSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
