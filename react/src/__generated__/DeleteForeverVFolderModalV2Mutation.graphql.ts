/**
 * @generated SignedSource<<968052caac758d86a0edcdf925791ffb>>
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
    "cacheID": "08f62ce93b257312e680011ac516ce05",
    "id": null,
    "metadata": {},
    "name": "DeleteForeverVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteForeverVFolderModalV2Mutation(\n  $input: BulkPurgeVFoldersV2Input!\n) {\n  bulkPurgeVfoldersV2(input: $input) {\n    successes\n    failed {\n      vfolderId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "473054b15aa5bd925d740ed06bbaf73c";

export default node;
