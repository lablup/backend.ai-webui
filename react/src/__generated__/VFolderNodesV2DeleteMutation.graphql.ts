/**
 * @generated SignedSource<<b02959ba14a4f0ddd6cd001a284d40e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderNodesV2DeleteMutation$variables = {
  vfolderId: string;
};
export type VFolderNodesV2DeleteMutation$data = {
  readonly deleteVfolderV2: {
    readonly id: string;
  } | null | undefined;
};
export type VFolderNodesV2DeleteMutation = {
  response: VFolderNodesV2DeleteMutation$data;
  variables: VFolderNodesV2DeleteMutation$variables;
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
    "concreteType": "DeleteVFolderV2Payload",
    "kind": "LinkedField",
    "name": "deleteVfolderV2",
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
    "name": "VFolderNodesV2DeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderNodesV2DeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "267b27dfe24bf987d3e29f11f2c03074",
    "id": null,
    "metadata": {},
    "name": "VFolderNodesV2DeleteMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderNodesV2DeleteMutation(\n  $vfolderId: UUID!\n) {\n  deleteVfolderV2(vfolderId: $vfolderId) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6a3f03b7eacad2630bd79321d5da93d7";

export default node;
