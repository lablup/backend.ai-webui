/**
 * @generated SignedSource<<6c14e44113776800267f5d8f7c4185c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SFTPServerButtonV2TestQuery$variables = {
  vfolderId: string;
};
export type SFTPServerButtonV2TestQuery$data = {
  readonly vfolderV2: {
    readonly " $fragmentSpreads": FragmentRefs<"SFTPServerButtonV2Fragment">;
  } | null | undefined;
};
export type SFTPServerButtonV2TestQuery = {
  response: SFTPServerButtonV2TestQuery$data;
  variables: SFTPServerButtonV2TestQuery$variables;
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
    "name": "SFTPServerButtonV2TestQuery",
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
            "name": "SFTPServerButtonV2Fragment"
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
    "name": "SFTPServerButtonV2TestQuery",
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
    "cacheID": "adc7a2183bb7de55b41e51dff543bbfa",
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
    "name": "SFTPServerButtonV2TestQuery",
    "operationKind": "query",
    "text": "query SFTPServerButtonV2TestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...SFTPServerButtonV2Fragment\n    id\n  }\n}\n\nfragment SFTPServerButtonV2Fragment on VFolder {\n  id\n  host\n}\n"
  }
};
})();

(node as any).hash = "be98268f63d95a680c61700ce31ab80a";

export default node;
