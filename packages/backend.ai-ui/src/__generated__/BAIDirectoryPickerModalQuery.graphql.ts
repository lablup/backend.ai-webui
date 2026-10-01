/**
 * @generated SignedSource<<163516a0245e00b695d86b548da813df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type BAIDirectoryPickerModalQuery$variables = {
  vfolderId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
  readonly vfolderV2: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly permissions: ReadonlyArray<PermissionBit>;
  } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
  response: BAIDirectoryPickerModalQuery$data;
  variables: BAIDirectoryPickerModalQuery$variables;
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
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "permissions",
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
    "name": "BAIDirectoryPickerModalQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDirectoryPickerModalQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3190062f81d256225b8d3e26ef8cdff5",
    "id": null,
    "metadata": {},
    "name": "BAIDirectoryPickerModalQuery",
    "operationKind": "query",
    "text": "query BAIDirectoryPickerModalQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    metadata {\n      name\n    }\n    permissions @since(version: \"26.9.0rc1\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "35256714c03179b67282204d7ae3c8be";

export default node;
