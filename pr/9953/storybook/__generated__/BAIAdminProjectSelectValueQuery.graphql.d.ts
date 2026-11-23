import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminProjectSelectValueQuery$variables = {
    projectIds: ReadonlyArray<string>;
    skipSelected: boolean;
};
export type BAIAdminProjectSelectValueQuery$data = {
    readonly adminProjectsV2?: {
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
