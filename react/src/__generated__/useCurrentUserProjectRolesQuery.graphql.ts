/**
 * @generated SignedSource<<09fe9d0a3b0a94ad3d67e7b197899c02>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type useCurrentUserProjectRolesQuery$variables = Record<PropertyKey, never>;
export type useCurrentUserProjectRolesQuery$data = {
  readonly projectAdminRoles: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly scopeId: string;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useCurrentUserProjectRolesQuery = {
  response: useCurrentUserProjectRolesQuery$data;
  variables: useCurrentUserProjectRolesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": "projectAdminRoles",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "mappedScope": {
          "scopeType": {
            "iEquals": "project"
          }
        },
        "permissions": {
          "some": {
            "entityType": {
              "iEquals": "scope_admin"
            }
          }
        },
        "status": {
          "equals": "ACTIVE"
        }
      }
    },
    {
      "kind": "Literal",
      "name": "first",
      "value": 100
    }
  ],
  "concreteType": "RoleConnection",
  "kind": "LinkedField",
  "name": "myRolesV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "RoleEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Role",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "scopeId",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "myRolesV2(filter:{\"mappedScope\":{\"scopeType\":{\"iEquals\":\"project\"}},\"permissions\":{\"some\":{\"entityType\":{\"iEquals\":\"scope_admin\"}}},\"status\":{\"equals\":\"ACTIVE\"}},first:100)"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v0/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      (v0/*: any*/)
    ]
  },
  "params": {
    "cacheID": "12d7af675d3d1dee98781756e77769b9",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesQuery {\n  projectAdminRoles: myRolesV2(first: 100, filter: {status: {equals: ACTIVE}, mappedScope: {scopeType: {iEquals: \"project\"}}, permissions: {some: {entityType: {iEquals: \"scope_admin\"}}}}) {\n    edges {\n      node {\n        id\n        scopeId\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d5d8c15ed14b069427329bd3b181163";

export default node;
