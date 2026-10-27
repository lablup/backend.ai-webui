/**
 * @generated SignedSource<<e817cadfaf0c2559762270a3f4685ae8>>
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
    "cacheID": "40f7bea71386e17202f160ea4421c253",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalV2OwnershipProjectQuery",
    "operationKind": "query",
    "text": "query FolderExplorerModalV2OwnershipProjectQuery(\n  $projectId: String!\n) {\n  group_node(id: $projectId) {\n    id\n    type\n  }\n}\n"
  }
};
})();

(node as any).hash = "a0e3de62f6cdab6b0f3803dbb9f12587";

export default node;
