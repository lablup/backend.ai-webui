import { ConcreteRequest } from 'relay-runtime';
export type BAIDirectoryPickerModalQuery$variables = {
    vfolderGlobalId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
    readonly vfolder_node: {
        readonly name: string | null | undefined;
        readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
    } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
    response: BAIDirectoryPickerModalQuery$data;
    variables: BAIDirectoryPickerModalQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
