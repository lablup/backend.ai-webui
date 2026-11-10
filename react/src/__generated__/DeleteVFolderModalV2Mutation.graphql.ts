/**
 * @generated SignedSource<<09db4c48abd40fd3d86c5b3119ecb39f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkDeleteVFoldersInput = {
  ids: ReadonlyArray<string>;
};
export type DeleteVFolderModalV2Mutation$variables = {
  input: PartialBulkDeleteVFoldersInput;
};
export type DeleteVFolderModalV2Mutation$data = {
  readonly partialBulkDeleteVfoldersV2: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly id: string;
    }>;
  };
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "PartialBulkVFoldersPayload",
    "kind": "LinkedField",
    "name": "partialBulkDeleteVfoldersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "successes",
        "plural": true,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PartialBulkFailure",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
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
    "name": "DeleteVFolderModalV2Mutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeleteVFolderModalV2Mutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "1ff832acf0156922e96d7cf547782928",
    "id": null,
    "metadata": {},
    "name": "DeleteVFolderModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation DeleteVFolderModalV2Mutation(\n  $input: PartialBulkDeleteVFoldersInput!\n) {\n  partialBulkDeleteVfoldersV2(input: $input) {\n    successes {\n      id\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "91b3a7847e9621ea2eb99f528f586114";

export default node;
