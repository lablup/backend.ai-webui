import { ConcreteRequest } from 'relay-runtime';
export type useLabelableEntityTypesQuery$variables = Record<PropertyKey, never>;
export type useLabelableEntityTypesQuery$data = {
    readonly entityTypes: ReadonlyArray<{
        readonly name: string;
    }>;
};
export type useLabelableEntityTypesQuery = {
    response: useLabelableEntityTypesQuery$data;
    variables: useLabelableEntityTypesQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
