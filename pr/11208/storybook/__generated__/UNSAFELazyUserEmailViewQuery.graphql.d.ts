import { ConcreteRequest } from 'relay-runtime';
export type UserScope = {
    domain?: ReadonlyArray<UUIDScope> | null | undefined;
    project?: ReadonlyArray<UUIDScope> | null | undefined;
    role?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
    value: string;
};
export type UNSAFELazyUserEmailViewQuery$variables = {
    scope: UserScope;
    uuid: string;
};
export type UNSAFELazyUserEmailViewQuery$data = {
    readonly scopedUsersV2: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly basicInfo: {
                    readonly email: string;
                };
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type UNSAFELazyUserEmailViewQuery = {
    response: UNSAFELazyUserEmailViewQuery$data;
    variables: UNSAFELazyUserEmailViewQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
