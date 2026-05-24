/**
 * @generated SignedSource<<d39ed56195bf60b52197ce2e391ea950>>
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
};
export type DeleteForeverVFolderModalV2Mutation$variables = {
  input: BulkPurgeVFoldersV2Input;
};
export type DeleteForeverVFolderModalV2Mutation$data = {
  readonly bulkPurgeVfoldersV2: {
    readonly purgedCount: number;
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
    "cacheID": "ec0678be01bd641d826e9bc9a2693eb0",
    "id": null,
    "metadata": {},
    "name": "DeleteForeverVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteForeverVFolderModalV2Mutation(\n  $input: BulkPurgeVFoldersV2Input!\n) {\n  bulkPurgeVfoldersV2(input: $input) {\n    purgedCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "ed8f37af9563c755ccfc33151d5d168f";

export default node;
