import { ConcreteRequest } from 'relay-runtime';
export type useGetAvailableFolderNameQuery$variables = {
    legacyFilter: string;
    name: string;
    readsV2: boolean;
};
export type useGetAvailableFolderNameQuery$data = {
    readonly myVfolders?: {
        readonly count: number;
    } | null | undefined;
    readonly vfolder_nodes?: {
        readonly count: number | null | undefined;
    } | null | undefined;
};
export type useGetAvailableFolderNameQuery = {
    response: useGetAvailableFolderNameQuery$data;
    variables: useGetAvailableFolderNameQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
