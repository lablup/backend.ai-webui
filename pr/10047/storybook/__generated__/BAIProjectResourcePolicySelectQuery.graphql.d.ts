import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = {
    limit: number;
};
export type BAIProjectResourcePolicySelectQuery$data = {
    readonly adminProjectResourcePoliciesV2: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIProjectResourcePolicySelectQuery = {
    response: BAIProjectResourcePolicySelectQuery$data;
    variables: BAIProjectResourcePolicySelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
