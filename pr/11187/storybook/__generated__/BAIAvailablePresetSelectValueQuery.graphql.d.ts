import { ConcreteRequest } from 'relay-runtime';
export type BAIAvailablePresetSelectValueQuery$variables = {
    first: number;
    ids?: ReadonlyArray<string> | null | undefined;
    skip: boolean;
};
export type BAIAvailablePresetSelectValueQuery$data = {
    readonly deploymentRevisionPresets?: {
        readonly edges: ReadonlyArray<{
            readonly node: {
                readonly description: string | null | undefined;
                readonly id: string;
                readonly name: string;
            };
        }>;
    } | null | undefined;
};
export type BAIAvailablePresetSelectValueQuery = {
    response: BAIAvailablePresetSelectValueQuery$data;
    variables: BAIAvailablePresetSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
