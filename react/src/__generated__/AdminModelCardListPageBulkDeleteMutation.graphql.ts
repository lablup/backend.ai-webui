/**
 * @generated SignedSource<<382d87fb7e0cc5a5821ad66091a920c8>>
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
export type AdminModelCardListPageBulkDeleteMutation$variables = {
  input: BulkDeleteModelCardsV2Input;
};
export type AdminModelCardListPageBulkDeleteMutation$data = {
  readonly adminBulkDeleteModelCardsV2: {
    readonly failed: ReadonlyArray<{
      readonly cardId: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<string>;
  } | null | undefined;
};
export type AdminModelCardListPageBulkDeleteMutation = {
  response: AdminModelCardListPageBulkDeleteMutation$data;
  variables: AdminModelCardListPageBulkDeleteMutation$variables;
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
    "name": "AdminModelCardListPageBulkDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardListPageBulkDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "74eba942ff74fb006b1ccf73a34b49f4",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardListPageBulkDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardListPageBulkDeleteMutation(\n  $input: BulkDeleteModelCardsV2Input!\n) {\n  adminBulkDeleteModelCardsV2(input: $input) {\n    successes\n    failed {\n      cardId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "09131356976871fd5c8b7f460995a96f";

export default node;
