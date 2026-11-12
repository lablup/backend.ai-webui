/**
 * @generated SignedSource<<93fd5daccb0a8c56b94300d02f383016>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteVFolderAutoMountInput = {
  id: string;
};
export type VFolderAutoMountMetadataSectionDeleteMutation$variables = {
  input: DeleteVFolderAutoMountInput;
};
export type VFolderAutoMountMetadataSectionDeleteMutation$data = {
  readonly deleteVfolderAutoMount: {
    readonly vfolderAutoMount: {
      readonly id: string;
    };
  } | null | undefined;
};
export type VFolderAutoMountMetadataSectionDeleteMutation = {
  response: VFolderAutoMountMetadataSectionDeleteMutation$data;
  variables: VFolderAutoMountMetadataSectionDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DeleteVFolderAutoMountPayload",
    "kind": "LinkedField",
    "name": "deleteVfolderAutoMount",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolderAutoMount",
        "kind": "LinkedField",
        "name": "vfolderAutoMount",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fbb1283d13e4079c0bbde72f25dbc699",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountMetadataSectionDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountMetadataSectionDeleteMutation(\n  $input: DeleteVFolderAutoMountInput!\n) {\n  deleteVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9d71448b5d248f1f0958b24dd20aaf74";

export default node;
