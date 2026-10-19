import { ConcreteRequest } from 'relay-runtime';
export type ProjectScope = {
    domain?: ReadonlyArray<UUIDScope> | null | undefined;
    resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
    user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
    value: string;
};
export type BAIScopedProjectSelectValueQuery$variables = {
    projectIds: ReadonlyArray<string>;
    scope: ProjectScope;
    skipSelected: boolean;
};
export type BAIScopedProjectSelectValueQuery$data = {
    readonly scopedProjectsV2?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly basicInfo: {
                    readonly name: string;
                };
                readonly entityId: string;
                readonly id: string;
            };
        }>;
    } | null | undefined;
};
export type BAIScopedProjectSelectValueQuery = {
    response: BAIScopedProjectSelectValueQuery$data;
    variables: BAIScopedProjectSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
