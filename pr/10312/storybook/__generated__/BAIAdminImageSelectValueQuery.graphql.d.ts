import { ConcreteRequest } from 'relay-runtime';
export type ImageSearchScope = {
    containerRegistry?: ReadonlyArray<UUIDScope> | null | undefined;
    domain?: ReadonlyArray<UUIDScope> | null | undefined;
    project?: ReadonlyArray<UUIDScope> | null | undefined;
    public?: boolean;
    user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
    value: string;
};
export type BAIAdminImageSelectValueQuery$variables = {
    ids?: ReadonlyArray<string> | null | undefined;
    scope: ImageSearchScope;
    skipAdmin: boolean;
    skipScoped: boolean;
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
    readonly scopedImagesV2?: {
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
