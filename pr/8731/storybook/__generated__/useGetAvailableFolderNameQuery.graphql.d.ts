import { ConcreteRequest } from 'relay-runtime';
export type useGetAvailableFolderNameQuery$variables = {
    filter: string;
};
export type useGetAvailableFolderNameQuery$data = {
    readonly vfolder_nodes: {
        readonly count: number | null | undefined;
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly name: string | null | undefined;
                readonly status: string | null | undefined;
            } | null | undefined;
        } | null | undefined>;
    } | null | undefined;
};
export type useGetAvailableFolderNameQuery = {
    response: useGetAvailableFolderNameQuery$data;
    variables: useGetAvailableFolderNameQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
