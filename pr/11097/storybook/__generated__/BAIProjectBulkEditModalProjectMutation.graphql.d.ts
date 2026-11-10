import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkUpdateProjectsInput = {
    items: ReadonlyArray<PartialBulkUpdateProjectItemInput>;
};
export type PartialBulkUpdateProjectItemInput = {
    id: string;
    input: UpdateProjectInput;
};
export type UpdateProjectInput = {
    description?: string | null | undefined;
    integrationName?: string | null | undefined;
    isActive?: boolean | null | undefined;
    name?: string | null | undefined;
    resourcePolicy?: string | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation$variables = {
    input: PartialBulkUpdateProjectsInput;
};
export type BAIProjectBulkEditModalProjectMutation$data = {
    readonly partialBulkUpdateProjectsV2: {
        readonly failed: ReadonlyArray<{
            readonly id: string;
            readonly message: string;
        }>;
        readonly successes: ReadonlyArray<{
            readonly id: string;
            readonly organization: {
                readonly resourcePolicy: string;
            };
        }>;
    };
};
export type BAIProjectBulkEditModalProjectMutation = {
    response: BAIProjectBulkEditModalProjectMutation$data;
    variables: BAIProjectBulkEditModalProjectMutation$variables;
};
declare const node: ConcreteRequest;
export default node;
