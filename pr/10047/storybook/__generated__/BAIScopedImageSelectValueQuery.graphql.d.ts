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
export type BAIScopedImageSelectValueQuery$variables = {
    ids?: ReadonlyArray<string> | null | undefined;
    scope: ImageSearchScope;
    skipSelected: boolean;
};
export type BAIScopedImageSelectValueQuery$data = {
    readonly scopedImagesV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly entityId: string;
                readonly id: string;
                readonly identity: {
                    readonly architecture: string;
                    readonly canonicalName: string;
                };
            };
        }>;
    } | null | undefined;
};
export type BAIScopedImageSelectValueQuery = {
    response: BAIScopedImageSelectValueQuery$data;
    variables: BAIScopedImageSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
