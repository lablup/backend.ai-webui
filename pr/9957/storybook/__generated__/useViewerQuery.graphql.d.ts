import { ConcreteRequest } from 'relay-runtime';
export type useViewerQuery$variables = Record<PropertyKey, never>;
export type useViewerQuery$data = {
    readonly viewer: {
        readonly encoded_user_role: string | null | undefined;
        readonly user: {
            readonly email: string | null | undefined;
        } | null | undefined;
    } | null | undefined;
};
export type useViewerQuery = {
    response: useViewerQuery$data;
    variables: useViewerQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
