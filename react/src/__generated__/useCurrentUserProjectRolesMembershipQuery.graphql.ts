/**
 * @generated SignedSource<<b3fccd2cab742727272e71fb92c27eda>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useCurrentUserProjectRolesMembershipQuery$variables = Record<PropertyKey, never>;
export type useCurrentUserProjectRolesMembershipQuery$data = {
  readonly myUserV2: {
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly entityId: string;
          readonly id: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type useCurrentUserProjectRolesMembershipQuery = {
  response: useCurrentUserProjectRolesMembershipQuery$data;
  variables: useCurrentUserProjectRolesMembershipQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true
      }
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 100
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "entityId",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "projects(filter:{\"isActive\":true},limit:100)"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesMembershipQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "UserV2",
          "kind": "LinkedField",
          "name": "myUserV2",
          "plural": false,
          "selections": [
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        "to": "NULL"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesMembershipQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "36f79cd0ff569043d82cf5fd4467f2e8",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesMembershipQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesMembershipQuery {\n  myUserV2 {\n    projects(filter: {isActive: true}, limit: 100) {\n      edges {\n        node {\n          id\n          entityId\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0866607dd24c8afdbfaf39dddf7ed6d1";

export default node;
