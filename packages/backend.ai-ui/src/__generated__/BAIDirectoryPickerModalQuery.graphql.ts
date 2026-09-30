/**
 * @generated SignedSource<<024aa6f1fed58f40405c6d26b18449e8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type BAIDirectoryPickerModalQuery$variables = {
  supportsPermissionBits: boolean;
  vfolderGlobalId: string;
  vfolderId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
  readonly legacyVFolderNode?: {
    readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  } | null | undefined;
  readonly vfolderV2: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly permissions?: ReadonlyArray<PermissionBit>;
  } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
  response: BAIDirectoryPickerModalQuery$data;
  variables: BAIDirectoryPickerModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsPermissionBits"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderGlobalId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "vfolderId",
      "variableName": "vfolderId"
    }
  ],
  "concreteType": "VFolder",
  "kind": "LinkedField",
  "name": "vfolderV2",
  "plural": false,
  "selections": [
    (v3/*: any*/),
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
    },
    {
      "condition": "supportsPermissionBits",
      "kind": "Condition",
      "passingValue": true,
      "selections": (v5/*: any*/)
    }
  ],
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "vfolderGlobalId"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDirectoryPickerModalQuery",
    "selections": [
      (v6/*: any*/),
      {
        "condition": "supportsPermissionBits",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "legacyVFolderNode",
            "args": (v7/*: any*/),
            "concreteType": "VirtualFolderNode",
            "kind": "LinkedField",
            "name": "vfolder_node",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIDirectoryPickerModalQuery",
    "selections": [
      (v6/*: any*/),
      {
        "condition": "supportsPermissionBits",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": "legacyVFolderNode",
            "args": (v7/*: any*/),
            "concreteType": "VirtualFolderNode",
            "kind": "LinkedField",
            "name": "vfolder_node",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d1d2ef348b249e0a9ce2226a3b6a148a",
    "id": null,
    "metadata": {},
    "name": "BAIDirectoryPickerModalQuery",
    "operationKind": "query",
    "text": "query BAIDirectoryPickerModalQuery(\n  $vfolderId: UUID!\n  $vfolderGlobalId: String!\n  $supportsPermissionBits: Boolean!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    metadata {\n      name\n    }\n    permissions @include(if: $supportsPermissionBits) @since(version: \"26.9.0\")\n  }\n  legacyVFolderNode: vfolder_node(id: $vfolderGlobalId) @skip(if: $supportsPermissionBits) @deprecatedSince(version: \"26.9.0\") {\n    permissions\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4565826fa1942221e9db2ccedd88013";

export default node;
