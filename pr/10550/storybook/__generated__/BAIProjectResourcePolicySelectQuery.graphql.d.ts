import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectResourcePolicySelectQuery$variables = Record<PropertyKey, never>;
export type BAIProjectResourcePolicySelectQuery$data = {
    readonly project_resource_policies: ReadonlyArray<{
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
