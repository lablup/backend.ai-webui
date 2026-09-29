/**
 * @generated SignedSource<<9afbab8199bdcebc69bc6203b8b6ab6b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkDeleteVFoldersV2Input = {
  ids: ReadonlyArray<string>;
};
export type DeleteVFolderModalV2Mutation$variables = {
  input: BulkDeleteVFoldersV2Input;
};
export type DeleteVFolderModalV2Mutation$data = {
  readonly bulkDeleteVfoldersV2: {
    readonly deletedCount: number;
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly vfolderId: string;
    }>;
    readonly items: ReadonlyArray<{
      readonly id: string;
    }>;
  } | null | undefined;
};
export type DeleteVFolderModalV2Mutation = {
  response: DeleteVFolderModalV2Mutation$data;
  variables: DeleteVFolderModalV2Mutation$variables;
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
    "concreteType": "BulkDeleteVFoldersV2Payload",
    "kind": "LinkedField",
    "name": "bulkDeleteVfoldersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkDeleteVFolderV2Error",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "vfolderId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedCount",
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
    "name": "DeleteVFolderModalV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeleteVFolderModalV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ee3e97a85af9c6b5d681ea26074a160b",
    "id": null,
    "metadata": {},
    "name": "DeleteVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteVFolderModalV2Mutation(\n  $input: BulkDeleteVFoldersV2Input!\n) {\n  bulkDeleteVfoldersV2(input: $input) {\n    items @since(version: \"26.9.0\") {\n      id\n    }\n    failed @since(version: \"26.9.0\") {\n      vfolderId\n      message\n    }\n    deletedCount @deprecatedSince(version: \"26.9.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "43ec619764a3c87bdd5b6bf723e7080c";

export default node;
