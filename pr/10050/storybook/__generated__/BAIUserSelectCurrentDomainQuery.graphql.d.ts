import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectCurrentDomainQuery$variables = {
    domainName: string;
    skip: boolean;
};
export type BAIUserSelectCurrentDomainQuery$data = {
    readonly domainV2?: {
        readonly entityId: string;
    } | null | undefined;
};
export type BAIUserSelectCurrentDomainQuery = {
    response: BAIUserSelectCurrentDomainQuery$data;
    variables: BAIUserSelectCurrentDomainQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
