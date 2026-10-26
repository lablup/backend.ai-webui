import { ConcreteRequest } from 'relay-runtime';
export type useGetAvailableFolderNameQuery$variables = {
    name: string;
};
export type useGetAvailableFolderNameQuery$data = {
    readonly myVfolders: {
        readonly count: number;
    } | null | undefined;
};
export type useGetAvailableFolderNameQuery = {
    response: useGetAvailableFolderNameQuery$data;
    variables: useGetAvailableFolderNameQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
