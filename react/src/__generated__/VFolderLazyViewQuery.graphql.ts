/**
 * @generated SignedSource<<7b9fb6c262bb4e4d27f4730c77d3b691>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderLazyViewQuery$variables = {
  id: string;
};
export type VFolderLazyViewQuery$data = {
  readonly vfolder_node: {
    readonly id: string;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonFragment">;
  } | null | undefined;
};
export type VFolderLazyViewQuery = {
  response: VFolderLazyViewQuery$data;
  variables: VFolderLazyViewQuery$variables;
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
    "name": "VFolderLazyViewQuery",
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
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VFolderNodeIdenticonFragment"
          }
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
    "name": "VFolderLazyViewQuery",
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
    "cacheID": "9741b4e48e1380bf300c9109258c38dd",
    "id": null,
    "metadata": {},
    "name": "VFolderLazyViewQuery",
    "operationKind": "query",
    "text": "query VFolderLazyViewQuery(\n  $id: String!\n) {\n  vfolder_node(id: $id) {\n    id\n    name\n    ...VFolderNodeIdenticonFragment\n  }\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "403cbd1b2a26241898d8c1f1893de307";

export default node;
