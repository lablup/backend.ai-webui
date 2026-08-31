import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminImageSelectValueQuery$variables = {
    ids?: ReadonlyArray<string> | null | undefined;
    skipSelected: boolean;
};
export type BAIAdminImageSelectValueQuery$data = {
    readonly adminImagesV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly id: string;
                readonly identity: {
                    readonly architecture: string;
                    readonly canonicalName: string;
                };
            };
        }>;
    } | null | undefined;
};
export type BAIAdminImageSelectValueQuery = {
    response: BAIAdminImageSelectValueQuery$data;
    variables: BAIAdminImageSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
