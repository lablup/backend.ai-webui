/**
 * @generated SignedSource<<177313f73fdcc3ac12c8e3a6c85a65d6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkDeleteModelCardsV2Input = {
  ids: ReadonlyArray<string>;
  options?: DeleteModelCardV2Options | null | undefined;
};
export type DeleteModelCardV2Options = {
  deleteAssociatedVfolder?: boolean;
};
export type AdminModelCardBulkDeleteMutation$variables = {
  input: BulkDeleteModelCardsV2Input;
};
export type AdminModelCardBulkDeleteMutation$data = {
  readonly adminBulkDeleteModelCardsV2: {
    readonly failed: ReadonlyArray<{
      readonly cardId: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<string>;
  } | null | undefined;
};
export type AdminModelCardBulkDeleteMutation = {
  response: AdminModelCardBulkDeleteMutation$data;
  variables: AdminModelCardBulkDeleteMutation$variables;
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
    "concreteType": "BulkDeleteModelCardsV2Payload",
    "kind": "LinkedField",
    "name": "adminBulkDeleteModelCardsV2",
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
        "concreteType": "BulkDeleteModelCardV2Error",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cardId",
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
    "name": "AdminModelCardBulkDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardBulkDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "41531d617eda12f10098bff2e4623f27",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardBulkDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardBulkDeleteMutation(\n  $input: BulkDeleteModelCardsV2Input!\n) {\n  adminBulkDeleteModelCardsV2(input: $input) {\n    successes\n    failed {\n      cardId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "91c710abd67f83d9dce9f866a1c82272";

export default node;
