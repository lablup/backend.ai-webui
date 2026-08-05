/**
 * @generated SignedSource<<a3c05b0ef424601184ee0c306c842726>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FileBrowserButtonV2TestQuery$variables = {
  vfolderId: string;
};
export type FileBrowserButtonV2TestQuery$data = {
  readonly vfolderV2: {
    readonly " $fragmentSpreads": FragmentRefs<"FileBrowserButtonV2Fragment">;
  } | null | undefined;
};
export type FileBrowserButtonV2TestQuery = {
  response: FileBrowserButtonV2TestQuery$data;
  variables: FileBrowserButtonV2TestQuery$variables;
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
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FileBrowserButtonV2TestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FileBrowserButtonV2Fragment"
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
    "name": "FileBrowserButtonV2TestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
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
            "name": "host",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "60112ae1ba2959395759c78a9d26f26f",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "vfolderV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "VFolder"
        },
        "vfolderV2.host": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "vfolderV2.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "FileBrowserButtonV2TestQuery",
    "operationKind": "query",
    "text": "query FileBrowserButtonV2TestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...FileBrowserButtonV2Fragment\n    id\n  }\n}\n\nfragment FileBrowserButtonV2Fragment on VFolder {\n  id\n  host\n}\n"
  }
};
})();

(node as any).hash = "f0907a3848dc17be7f2abb61cab08bdd";

export default node;
