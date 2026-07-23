/**
 * @generated SignedSource<<ab4f6ae0d5ae331d027a792ee9254e40>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderNodesV2RestoreMutation$variables = {
  vfolderId: string;
};
export type VFolderNodesV2RestoreMutation$data = {
  readonly restoreVFolder: {
    readonly id: string;
  } | null | undefined;
};
export type VFolderNodesV2RestoreMutation = {
  response: VFolderNodesV2RestoreMutation$data;
  variables: VFolderNodesV2RestoreMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "RestoreVFolderPayload",
    "kind": "LinkedField",
    "name": "restoreVFolder",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodesV2RestoreMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderNodesV2RestoreMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fc05c41196eaa2483ea656725bdc2909",
    "id": null,
    "metadata": {},
    "name": "VFolderNodesV2RestoreMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderNodesV2RestoreMutation(\n  $vfolderId: UUID!\n) {\n  restoreVFolder(vfolderId: $vfolderId) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "786c5ce4389066e04eac9355a031686d";

export default node;
