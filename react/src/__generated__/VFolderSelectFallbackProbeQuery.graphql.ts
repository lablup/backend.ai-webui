/**
 * @generated SignedSource<<150be45cef7cd6ca14e0f5a7507a3669>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderSelectFallbackProbeQuery$variables = {
  id: string;
};
export type VFolderSelectFallbackProbeQuery$data = {
  readonly vfolder_node: {
    readonly id: string;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type VFolderSelectFallbackProbeQuery = {
  response: VFolderSelectFallbackProbeQuery$data;
  variables: VFolderSelectFallbackProbeQuery$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderSelectFallbackProbeQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": (v2/*: any*/),
            "action": "THROW"
          },
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
    "name": "VFolderSelectFallbackProbeQuery",
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
    ]
  },
  "params": {
    "cacheID": "da99902d427e52570942abb8538623e1",
    "id": null,
    "metadata": {},
    "name": "VFolderSelectFallbackProbeQuery",
    "operationKind": "query",
    "text": "query VFolderSelectFallbackProbeQuery(\n  $id: String!\n) {\n  vfolder_node(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "f3396db6f9c27f4a6f3b7f51ddc2874d";

export default node;
