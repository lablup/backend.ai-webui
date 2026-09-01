/**
 * @generated SignedSource<<8adaab42c58a58409ab93d8944e89086>>
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
  supportsPerIdResults: boolean;
};
export type DeleteForeverVFolderModalV2Mutation$data = {
  readonly bulkPurgeVfoldersV2: {
    readonly failed?: ReadonlyArray<{
      readonly message: string;
      readonly vfolderId: string;
    }>;
    readonly purgedCount?: number;
    readonly successes?: ReadonlyArray<string>;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "supportsPerIdResults"
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
        "condition": "supportsPerIdResults",
        "kind": "Condition",
        "passingValue": true,
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
          }
        ]
      },
      {
        "condition": "supportsPerIdResults",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "purgedCount",
            "storageKey": null
          }
        ]
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
    "cacheID": "f4dfba95b9ba3ce7290b05184e91e17b",
    "id": null,
    "metadata": {},
    "name": "DeleteForeverVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteForeverVFolderModalV2Mutation(\n  $input: BulkPurgeVFoldersV2Input!\n  $supportsPerIdResults: Boolean!\n) {\n  bulkPurgeVfoldersV2(input: $input) {\n    successes @include(if: $supportsPerIdResults)\n    failed @include(if: $supportsPerIdResults) {\n      vfolderId\n      message\n    }\n    purgedCount @skip(if: $supportsPerIdResults)\n  }\n}\n"
  }
};
})();

(node as any).hash = "ff0dca42b38126ab4869668cb6e2f61a";

export default node;
