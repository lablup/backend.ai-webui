/**
 * @generated SignedSource<<dd03830ff95e6e081555f7c3c2338b99>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useCurrentUserProjectRolesProjectsQuery$variables = {
  email?: string | null | undefined;
};
export type useCurrentUserProjectRolesProjectsQuery$data = {
  readonly user: {
    readonly groups: ReadonlyArray<{
      readonly id: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type useCurrentUserProjectRolesProjectsQuery = {
  response: useCurrentUserProjectRolesProjectsQuery$data;
  variables: useCurrentUserProjectRolesProjectsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesProjectsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesProjectsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0392c93157265ac8e17f795bb37ac2a0",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesProjectsQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesProjectsQuery(\n  $email: String\n) {\n  user(email: $email) {\n    groups {\n      id\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0847bcd3b7ea01235e956fec505c7eea";

export default node;
