import { ConcreteRequest } from 'relay-runtime';
export type BAIDomainSelectV2Query$variables = {
    isActive?: boolean | null | undefined;
};
export type BAIDomainSelectV2Query$data = {
    readonly adminDomainsV2: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly basicInfo: {
                    readonly name: string;
                };
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type BAIDomainSelectV2Query = {
    response: BAIDomainSelectV2Query$data;
    variables: BAIDomainSelectV2Query$variables;
};
declare const node: ConcreteRequest;
export default node;
