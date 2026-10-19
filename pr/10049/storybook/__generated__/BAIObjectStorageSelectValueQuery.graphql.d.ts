import { ConcreteRequest } from 'relay-runtime';
export type BAIObjectStorageSelectValueQuery$variables = {
    id: string;
    skipSelected: boolean;
};
export type BAIObjectStorageSelectValueQuery$data = {
    readonly objectStorage?: {
        readonly id: string;
        readonly name: string;
    } | null | undefined;
};
export type BAIObjectStorageSelectValueQuery = {
    response: BAIObjectStorageSelectValueQuery$data;
    variables: BAIObjectStorageSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
