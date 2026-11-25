/**
 * @generated SignedSource<<d5a1935124c0eabdc877477f92c8b30a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SharedFolderPermissionInfoModalV2MySharesQuery$variables = {
  folderId: string;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery$data = {
  readonly myEntityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery = {
  response: SharedFolderPermissionInfoModalV2MySharesQuery$data;
  variables: SharedFolderPermissionInfoModalV2MySharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "folderId"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Literal",
        "name": "status",
        "value": {
          "equals": "ACCEPTED"
        }
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "equals",
            "variableName": "folderId"
          }
        ],
        "kind": "ObjectValue",
        "name": "targetEntityId"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Literal",
    "name": "sides",
    "value": [
      "RECIPIENT"
    ]
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
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
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
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
    "cacheID": "6daa6cbc47e235462ddcd6d9328fcbd9",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2MySharesQuery(\n  $folderId: UUID!\n) {\n  myEntityShares(sides: [RECIPIENT], filter: {targetEntityId: {equals: $folderId}, status: {equals: ACCEPTED}}, limit: 1) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9645a99dee5b81706eb008acd26b397a";

export default node;
