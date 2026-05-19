/**
 * @generated SignedSource<<b08d2a6eb206a397bad8ea27d9db9ef7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderNodeDescriptionPermissionRefreshQuery$variables = {
  id: string;
};
export type VFolderNodeDescriptionPermissionRefreshQuery$data = {
  readonly vfolder_node: {
    readonly permission: string | null | undefined;
    readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  } | null | undefined;
};
export type VFolderNodeDescriptionPermissionRefreshQuery = {
  response: VFolderNodeDescriptionPermissionRefreshQuery$data;
  variables: VFolderNodeDescriptionPermissionRefreshQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permission",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodeDescriptionPermissionRefreshQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "name": "VFolderNodeDescriptionPermissionRefreshQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
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
    ]
  },
  "params": {
    "cacheID": "3aee063a4b508648c2365ba6c7f0f44a",
    "id": null,
    "metadata": {},
    "name": "VFolderNodeDescriptionPermissionRefreshQuery",
    "operationKind": "query",
    "text": "query VFolderNodeDescriptionPermissionRefreshQuery(\n  $id: String!\n) {\n  vfolder_node(id: $id) {\n    permission\n    permissions\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "36063c8300310d9ef6c369b49127a2a2";

export default node;
