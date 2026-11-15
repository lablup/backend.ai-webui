/**
 * @generated SignedSource<<118b9ada7ed8ee399b69974b5d68b74b>>
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
export type VFolderAutoMountListDeleteMutation$variables = {
  input: DeleteVFolderAutoMountInput;
};
export type VFolderAutoMountListDeleteMutation$data = {
  readonly deleteVfolderAutoMount: {
    readonly vfolderAutoMount: {
      readonly id: string;
    };
  } | null | undefined;
};
export type VFolderAutoMountListDeleteMutation = {
  response: VFolderAutoMountListDeleteMutation$data;
  variables: VFolderAutoMountListDeleteMutation$variables;
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
    "name": "VFolderAutoMountListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "VFolderAutoMountListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "84f0011b94257a4e9ce8240d3b7c9e50",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderAutoMountListDeleteMutation(\n  $input: DeleteVFolderAutoMountInput!\n) {\n  deleteVfolderAutoMount(input: $input) {\n    vfolderAutoMount {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2d3e16ea56bcada51e7197eb217dc6ad";

export default node;
