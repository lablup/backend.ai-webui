import { ConcreteRequest } from 'relay-runtime';
export type BAIDeploymentSelectValueQuery$variables = {
    id: string;
    skipSelected: boolean;
};
export type BAIDeploymentSelectValueQuery$data = {
    readonly deployment?: {
        readonly id: string;
        readonly metadata: {
            readonly name: string;
        };
    } | null | undefined;
};
export type BAIDeploymentSelectValueQuery = {
    response: BAIDeploymentSelectValueQuery$data;
    variables: BAIDeploymentSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
