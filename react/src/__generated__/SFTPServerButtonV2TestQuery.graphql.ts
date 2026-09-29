/**
 * @generated SignedSource<<d5dc322264475d0cfcdb50708411dbce>>
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
],
v2 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
};
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolderMetadataInfo",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f9f4af925a11699e6e992300e2f37222",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "vfolderV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "VFolder"
        },
        "vfolderV2.host": (v2/*: any*/),
        "vfolderV2.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "vfolderV2.metadata": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "VFolderMetadataInfo"
        },
        "vfolderV2.metadata.name": (v2/*: any*/)
      }
    },
    "name": "SFTPServerButtonV2TestQuery",
    "operationKind": "query",
    "text": "query SFTPServerButtonV2TestQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    ...SFTPServerButtonV2Fragment\n    id\n  }\n}\n\nfragment SFTPServerButtonV2Fragment on VFolder {\n  id\n  host\n  metadata {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "be98268f63d95a680c61700ce31ab80a";

export default node;
