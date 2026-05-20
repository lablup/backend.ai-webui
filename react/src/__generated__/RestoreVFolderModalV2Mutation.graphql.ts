/**
 * @generated SignedSource<<056da69c68f0966e5978747e8531935e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RestoreVFolderModalV2Mutation$variables = {
  vfolderId: string;
};
export type RestoreVFolderModalV2Mutation$data = {
  readonly restoreVFolder: {
    readonly id: string;
  } | null | undefined;
};
export type RestoreVFolderModalV2Mutation = {
  response: RestoreVFolderModalV2Mutation$data;
  variables: RestoreVFolderModalV2Mutation$variables;
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
    "name": "RestoreVFolderModalV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RestoreVFolderModalV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "14d669a32252e8429330552a9eb6e82e",
    "id": null,
    "metadata": {},
    "name": "RestoreVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation RestoreVFolderModalV2Mutation(\n  $vfolderId: UUID!\n) {\n  restoreVFolder(vfolderId: $vfolderId) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0efe06c3f5b800e9b582b9d254f35ed3";

export default node;
