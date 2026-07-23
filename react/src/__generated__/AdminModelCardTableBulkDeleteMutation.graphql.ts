/**
 * @generated SignedSource<<142ce278ee03ffcceafd32a2cbd9b126>>
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
export type AdminModelCardTableBulkDeleteMutation$variables = {
  input: BulkDeleteModelCardsV2Input;
};
export type AdminModelCardTableBulkDeleteMutation$data = {
  readonly adminBulkDeleteModelCardsV2: {
    readonly failed: ReadonlyArray<{
      readonly cardId: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<string>;
  } | null | undefined;
};
export type AdminModelCardTableBulkDeleteMutation = {
  response: AdminModelCardTableBulkDeleteMutation$data;
  variables: AdminModelCardTableBulkDeleteMutation$variables;
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
    "name": "AdminModelCardTableBulkDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardTableBulkDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "19e2803dd2ca6fe652efc345ee47b4c6",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardTableBulkDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardTableBulkDeleteMutation(\n  $input: BulkDeleteModelCardsV2Input!\n) {\n  adminBulkDeleteModelCardsV2(input: $input) {\n    successes\n    failed {\n      cardId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "375c315f21356efee4f71f063ed71311";

export default node;
