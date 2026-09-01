import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminModelServiceSelectValueQuery$variables = {
    id: string;
    skipSelected: boolean;
};
export type BAIAdminModelServiceSelectValueQuery$data = {
    readonly deployment?: {
        readonly id: string;
        readonly metadata: {
            readonly name: string;
        };
    } | null | undefined;
};
export type BAIAdminModelServiceSelectValueQuery = {
    response: BAIAdminModelServiceSelectValueQuery$data;
    variables: BAIAdminModelServiceSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
