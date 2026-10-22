import { ConcreteRequest } from 'relay-runtime';
export type BAIRuntimeVariantSelectValueQuery$variables = {
    id: string;
    skip: boolean;
};
export type BAIRuntimeVariantSelectValueQuery$data = {
    readonly runtimeVariant?: {
        readonly id: string;
        readonly name: string;
        readonly readsVfolderConfigFiles: boolean;
    } | null | undefined;
};
export type BAIRuntimeVariantSelectValueQuery = {
    response: BAIRuntimeVariantSelectValueQuery$data;
    variables: BAIRuntimeVariantSelectValueQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
