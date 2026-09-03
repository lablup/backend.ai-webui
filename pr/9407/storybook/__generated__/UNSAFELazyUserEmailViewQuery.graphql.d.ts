import { ConcreteRequest } from 'relay-runtime';
export type UNSAFELazyUserEmailViewQuery$variables = {
    uuid: string;
};
export type UNSAFELazyUserEmailViewQuery$data = {
    readonly user_node: {
        readonly email: string | null | undefined;
    } | null | undefined;
};
export type UNSAFELazyUserEmailViewQuery = {
    response: UNSAFELazyUserEmailViewQuery$data;
    variables: UNSAFELazyUserEmailViewQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
