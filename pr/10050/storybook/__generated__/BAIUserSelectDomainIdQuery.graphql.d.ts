import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectDomainIdQuery$variables = {
    domainName: string;
};
export type BAIUserSelectDomainIdQuery$data = {
    readonly domainV2: {
        readonly entityId: string;
    } | null | undefined;
};
export type BAIUserSelectDomainIdQuery = {
    response: BAIUserSelectDomainIdQuery$data;
    variables: BAIUserSelectDomainIdQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
