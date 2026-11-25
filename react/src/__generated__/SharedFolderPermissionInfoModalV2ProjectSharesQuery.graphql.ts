/**
 * @generated SignedSource<<33781d727c8a0f41a235f5fc7c99b32f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UUIDScope = {
  value: string;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery$variables = {
  folderId: string;
  projects: ReadonlyArray<UUIDScope>;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly recipientEntityId: string | null | undefined;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery = {
  response: SharedFolderPermissionInfoModalV2ProjectSharesQuery$data;
  variables: SharedFolderPermissionInfoModalV2ProjectSharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "folderId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projects"
},
v2 = [
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
    "value": 100
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "recipientProject",
        "variableName": "projects"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityType",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
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
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
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
    "cacheID": "1d7ddc215e9b102b4c9e6e2befceddbb",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2ProjectSharesQuery(\n  $projects: [UUIDScope!]!\n  $folderId: UUID!\n) {\n  entityShares(scope: {recipientProject: $projects}, filter: {targetEntityId: {equals: $folderId}, status: {equals: ACCEPTED}}, limit: 100) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        recipientEntityId\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "566b308f883768b74c2e4680baa5a55e";

export default node;
