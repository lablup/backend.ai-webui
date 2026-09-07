import { ConcreteRequest } from 'relay-runtime';
export type BAIResourceGroupSelectQuery$variables = Record<PropertyKey, never>;
export type BAIResourceGroupSelectQuery$data = {
    readonly scaling_groups: ReadonlyArray<{
        readonly name: string | null | undefined;
    } | null | undefined> | null | undefined;
};
export type BAIResourceGroupSelectQuery = {
    response: BAIResourceGroupSelectQuery$data;
    variables: BAIResourceGroupSelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
