/**
 * @generated SignedSource<<649b3890a2a295d5ee34cbf023a26560>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkPurgeVFoldersV2Input = {
  ids: ReadonlyArray<string>;
  options?: PurgeVFolderOptionsInput | null | undefined;
};
export type PurgeVFolderOptionsInput = {
  cascadeModelCard?: boolean;
  force?: boolean;
};
export type DeleteForeverVFolderModalV2Mutation$variables = {
  input: BulkPurgeVFoldersV2Input;
};
export type DeleteForeverVFolderModalV2Mutation$data = {
  readonly bulkPurgeVfoldersV2: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly vfolderId: string;
    }>;
    readonly purgedCount: number;
    readonly successes: ReadonlyArray<string>;
  } | null | undefined;
};
export type DeleteForeverVFolderModalV2Mutation = {
  response: DeleteForeverVFolderModalV2Mutation$data;
  variables: DeleteForeverVFolderModalV2Mutation$variables;
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
    "concreteType": "BulkPurgeVFoldersV2Payload",
    "kind": "LinkedField",
    "name": "bulkPurgeVfoldersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "successes",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkPurgeVFolderV2Error",
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
        "name": "purgedCount",
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
    "name": "DeleteForeverVFolderModalV2Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeleteForeverVFolderModalV2Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e21f2911631da1ba93803af4b4b8c890",
    "id": null,
    "metadata": {},
    "name": "DeleteForeverVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteForeverVFolderModalV2Mutation(\n  $input: BulkPurgeVFoldersV2Input!\n) {\n  bulkPurgeVfoldersV2(input: $input) {\n    successes @since(version: \"26.9.0\")\n    failed @since(version: \"26.9.0\") {\n      vfolderId\n      message\n    }\n    purgedCount @deprecatedSince(version: \"26.9.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "9307df1ae20e7e43889308ea2dfc80f3";

export default node;
