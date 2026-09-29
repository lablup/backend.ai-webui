/**
 * @generated SignedSource<<6303e3289f684ae7a934b0c6172f5957>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FolderExplorerModalV2OwnershipProjectQuery$variables = {
  projectId: string;
};
export type FolderExplorerModalV2OwnershipProjectQuery$data = {
  readonly group_node: {
    readonly id: string;
    readonly type: string | null | undefined;
  } | null | undefined;
};
export type FolderExplorerModalV2OwnershipProjectQuery = {
  response: FolderExplorerModalV2OwnershipProjectQuery$data;
  variables: FolderExplorerModalV2OwnershipProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "projectId"
      }
    ],
    "concreteType": "GroupNode",
    "kind": "LinkedField",
    "name": "group_node",
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
        "name": "type",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderExplorerModalV2OwnershipProjectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderExplorerModalV2OwnershipProjectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dcbd8e092aa971137ec8a90e75b5a241",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalV2OwnershipProjectQuery",
    "operationKind": "query",
    "text": "query FolderExplorerModalV2OwnershipProjectQuery(\n  $projectId: String!\n) {\n  group_node(id: $projectId) @since(version: \"24.03.0\") {\n    id\n    type\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a373fe60530e9371efd306f3e746e6a";

export default node;
