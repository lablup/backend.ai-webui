/**
 * @generated SignedSource<<3e375f15dfa4433574d727ea3bb6a7b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkPurgeModelCardsInput = {
  ids: ReadonlyArray<string>;
  options?: DeleteModelCardV2Options | null | undefined;
};
export type DeleteModelCardV2Options = {
  deleteAssociatedVfolder?: boolean;
};
export type AdminModelCardBulkDeleteMutation$variables = {
  input: PartialBulkPurgeModelCardsInput;
};
export type AdminModelCardBulkDeleteMutation$data = {
  readonly partialBulkPurgeModelCardsV2: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly id: string;
    }>;
  };
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
    "concreteType": "PartialBulkModelCardsPayload",
    "kind": "LinkedField",
    "name": "partialBulkPurgeModelCardsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelCardV2",
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
    "name": "AdminModelCardBulkDeleteMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminModelCardBulkDeleteMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "3c2955201b8d4cbb313caec8ece4d5a3",
    "id": null,
    "metadata": {},
    "name": "AdminModelCardBulkDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminModelCardBulkDeleteMutation(\n  $input: PartialBulkPurgeModelCardsInput!\n) {\n  partialBulkPurgeModelCardsV2(input: $input) {\n    successes {\n      id\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "64e6b7173dd6b5d09bb43df36b4395ff";

export default node;
