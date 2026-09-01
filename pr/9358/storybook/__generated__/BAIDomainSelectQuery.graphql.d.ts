import { ConcreteRequest } from 'relay-runtime';
export type BAIDomainSelectQuery$variables = {
    is_active?: boolean | null | undefined;
};
export type BAIDomainSelectQuery$data = {
    readonly domains: ReadonlyArray<{
        readonly name: string | null | undefined;
    } | null | undefined> | null | undefined;
};
export type BAIDomainSelectQuery = {
    response: BAIDomainSelectQuery$data;
    variables: BAIDomainSelectQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
