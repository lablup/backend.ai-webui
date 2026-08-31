import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectVfolderSelectValueQuery$variables = {
    skip: boolean;
    vfolderId: string;
};
export type BAIProjectVfolderSelectValueQuery$data = {
    readonly vfolderV2?: {
        readonly id: string;
        readonly metadata: {
            readonly name: string;
        };
    } | null | undefined;
};
export type BAIProjectVfolderSelectValueQuery = {
    response: BAIProjectVfolderSelectValueQuery$data;
    variables: BAIProjectVfolderSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
