/**
 * @generated SignedSource<<c6509f5591a860728b0295079502c0e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LegacyModelTryContentButtonVFolderNodeListQuery$variables = {
  currentUserScopeFilter?: string | null | undefined;
  currentUserScopeId?: any | null | undefined;
  modelStoreScopeFilter?: string | null | undefined;
  modelStoreScopeId?: any | null | undefined;
  permission?: any | null | undefined;
};
export type LegacyModelTryContentButtonVFolderNodeListQuery$data = {
  readonly currentUserFolderNodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
      };
    } | null | undefined>;
  } | null | undefined;
  readonly modelStoreFolderNodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
        readonly status: string | null | undefined;
      };
    } | null | undefined>;
  } | null | undefined;
};
export type LegacyModelTryContentButtonVFolderNodeListQuery = {
  response: LegacyModelTryContentButtonVFolderNodeListQuery$data;
  variables: LegacyModelTryContentButtonVFolderNodeListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "currentUserScopeFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "currentUserScopeId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "modelStoreScopeFilter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "modelStoreScopeId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permission"
},
v5 = {
  "kind": "Variable",
  "name": "permission",
  "variableName": "permission"
},
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "modelStoreScopeFilter"
  },
  (v5/*: any*/),
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "modelStoreScopeId"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "kind": "RequiredField",
  "field": (v7/*: any*/),
  "action": "THROW"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
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
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v13 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "currentUserScopeFilter"
  },
  (v5/*: any*/),
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "currentUserScopeId"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "LegacyModelTryContentButtonVFolderNodeListQuery",
    "selections": [
      {
        "alias": "modelStoreFolderNodes",
        "args": (v6/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/)
                    ],
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          (v12/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "currentUserFolderNodes",
        "args": (v13/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "VirtualFolderNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          (v12/*: any*/)
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
      (v3/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "LegacyModelTryContentButtonVFolderNodeListQuery",
    "selections": [
      {
        "alias": "modelStoreFolderNodes",
        "args": (v6/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VirtualFolderNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v12/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "currentUserFolderNodes",
        "args": (v13/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "VirtualFolderNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v12/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7e19829358f63c9b44942d63f40cb515",
    "id": null,
    "metadata": {},
    "name": "LegacyModelTryContentButtonVFolderNodeListQuery",
    "operationKind": "query",
    "text": "query LegacyModelTryContentButtonVFolderNodeListQuery(\n  $modelStoreScopeId: ScopeField\n  $modelStoreScopeFilter: String\n  $permission: VFolderPermissionValueField\n  $currentUserScopeId: ScopeField\n  $currentUserScopeFilter: String\n) {\n  modelStoreFolderNodes: vfolder_nodes(scope_id: $modelStoreScopeId, filter: $modelStoreScopeFilter, permission: $permission) {\n    edges {\n      node {\n        id\n        status\n        name\n        row_id\n      }\n    }\n    count\n  }\n  currentUserFolderNodes: vfolder_nodes(scope_id: $currentUserScopeId, filter: $currentUserScopeFilter, permission: $permission) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "77830bb21d2700e6f1d726c241371168";

export default node;
