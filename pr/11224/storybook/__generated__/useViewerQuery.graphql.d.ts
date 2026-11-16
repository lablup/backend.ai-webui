import { ConcreteRequest } from 'relay-runtime';
export type UserRoleV2 = "ADMIN" | "MONITOR" | "SUPERADMIN" | "USER" | "%future added value";
export type useViewerQuery$variables = Record<PropertyKey, never>;
export type useViewerQuery$data = {
    readonly myUserV2: {
        readonly organization: {
            readonly role: UserRoleV2 | null | undefined;
        };
    } | null | undefined;
};
export type useViewerQuery = {
    response: useViewerQuery$data;
    variables: useViewerQuery$variables;
};
declare const node: ConcreteRequest;
export default node;
