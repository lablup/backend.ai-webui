import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminUserSelectDomainIdQuery$variables = {
    domainName: string;
};
export type BAIAdminUserSelectDomainIdQuery$data = {
    readonly domainV2: {
        readonly entityId: string;
    } | null | undefined;
};
export type BAIAdminUserSelectDomainIdQuery = {
    response: BAIAdminUserSelectDomainIdQuery$data;
    variables: BAIAdminUserSelectDomainIdQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
