import { ConcreteRequest } from 'relay-runtime';
export type ProjectScope = {
    domain?: ReadonlyArray<UUIDScope> | null | undefined;
    resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
    user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
    value: string;
};
export type BAIAdminProjectSelectValueQuery$variables = {
    projectIds: ReadonlyArray<string>;
    scope: ProjectScope;
    skipSelected: boolean;
};
export type BAIAdminProjectSelectValueQuery$data = {
    readonly scopedProjectsV2?: {
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
export type BAIAdminProjectSelectValueQuery = {
    response: BAIAdminProjectSelectValueQuery$data;
    variables: BAIAdminProjectSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
