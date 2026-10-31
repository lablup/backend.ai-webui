/**
 * @generated SignedSource<<f13690c5c8668d5677286f1bc5664212>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type UsersPanelProjectQuery$variables = {
  projectId: string;
};
export type UsersPanelProjectQuery$data = {
  readonly active: {
    readonly count: number;
  } | null | undefined;
  readonly adminRoles: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly name: string;
        readonly usersV2: {
          readonly count: number;
        } | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
  readonly inactive: {
    readonly count: number;
  } | null | undefined;
};
export type UsersPanelProjectQuery = {
  response: UsersPanelProjectQuery$data;
  variables: UsersPanelProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = {
  "equals": "ACTIVE"
},
v2 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v3 = {
  "kind": "Variable",
  "name": "projectId",
  "variableName": "projectId"
},
v4 = {
  "fields": [
    (v3/*: any*/)
  ],
  "kind": "ObjectValue",
  "name": "scope"
},
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v6 = {
  "alias": "active",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": (v1/*: any*/)
      }
    },
    (v2/*: any*/),
    (v4/*: any*/)
  ],
  "concreteType": "UserV2Connection",
  "kind": "LinkedField",
  "name": "projectUsersV2",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = {
  "alias": "inactive",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "INACTIVE"
        }
      }
    },
    (v2/*: any*/),
    (v4/*: any*/)
  ],
  "concreteType": "UserV2Connection",
  "kind": "LinkedField",
  "name": "projectUsersV2",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "permissions": {
        "some": {
          "entityType": {
            "iEquals": "scope_admin"
          }
        }
      },
      "status": (v1/*: any*/)
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 5
  },
  (v3/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": [
    (v2/*: any*/)
  ],
  "concreteType": "UserV2Connection",
  "kind": "LinkedField",
  "name": "usersV2",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": "usersV2(limit:1)"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UsersPanelProjectQuery",
    "selections": [
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "kind": "CatchField",
        "field": {
          "alias": "adminRoles",
          "args": (v8/*: any*/),
          "concreteType": "RoleConnection",
          "kind": "LinkedField",
          "name": "projectRoles",
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
                    (v9/*: any*/),
                    (v10/*: any*/),
                    (v11/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UsersPanelProjectQuery",
    "selections": [
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "alias": "adminRoles",
        "args": (v8/*: any*/),
        "concreteType": "RoleConnection",
        "kind": "LinkedField",
        "name": "projectRoles",
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
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a6ab23f2e2938633af15671e37cb73ac",
    "id": null,
    "metadata": {},
    "name": "UsersPanelProjectQuery",
    "operationKind": "query",
    "text": "query UsersPanelProjectQuery(\n  $projectId: UUID!\n) {\n  active: projectUsersV2(scope: {projectId: $projectId}, filter: {status: {equals: ACTIVE}}, limit: 1) {\n    count\n  }\n  inactive: projectUsersV2(scope: {projectId: $projectId}, filter: {status: {equals: INACTIVE}}, limit: 1) {\n    count\n  }\n  adminRoles: projectRoles(projectId: $projectId, filter: {status: {equals: ACTIVE}, permissions: {some: {entityType: {iEquals: \"scope_admin\"}}}}, limit: 5) {\n    edges {\n      node {\n        entityId\n        name\n        usersV2(limit: 1) {\n          count\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "90cf9069f7ad34950df0e47119bb0793";

export default node;
