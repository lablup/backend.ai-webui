/**
 * @generated SignedSource<<f702d5f6e38b5c6c2ab1304fd00ffb6a>>
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
  supportsPerIdResults: boolean;
};
export type DeleteVFolderModalV2Mutation$data = {
  readonly bulkDeleteVfoldersV2: {
    readonly deletedCount?: number;
    readonly failed?: ReadonlyArray<{
      readonly message: string;
      readonly vfolderId: string;
    }>;
    readonly items?: ReadonlyArray<{
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
    "concreteType": "BulkDeleteVFoldersV2Payload",
    "kind": "LinkedField",
    "name": "bulkDeleteVfoldersV2",
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
            "name": "deletedCount",
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
    "cacheID": "39bac138959ad91407870965c83f6b4f",
    "id": null,
    "metadata": {},
    "name": "DeleteVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteVFolderModalV2Mutation(\n  $input: BulkDeleteVFoldersV2Input!\n  $supportsPerIdResults: Boolean!\n) {\n  bulkDeleteVfoldersV2(input: $input) {\n    items @include(if: $supportsPerIdResults) {\n      id\n    }\n    failed @include(if: $supportsPerIdResults) {\n      vfolderId\n      message\n    }\n    deletedCount @skip(if: $supportsPerIdResults)\n  }\n}\n"
  }
};
})();

(node as any).hash = "e29b7b9e90604a22f2fe4660448deb00";

export default node;
