import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = {
    limit: number;
    supportsResourcePolicyV2: boolean;
};
export type BAIProjectResourcePolicySelectQuery$data = {
    readonly adminProjectResourcePoliciesV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
    readonly project_resource_policies?: ReadonlyArray<{
        readonly id: string;
        readonly name: string;
    } | null | undefined> | null | undefined;
};
export type BAIProjectResourcePolicySelectQuery = {
    response: BAIProjectResourcePolicySelectQuery$data;
    variables: BAIProjectResourcePolicySelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
