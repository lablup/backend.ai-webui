/**
 * @generated SignedSource<<01d2ceb28316f8530d6ed6c389ddaf8a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkTerminateSessionsInput = {
  forced?: boolean;
  ids: ReadonlyArray<string>;
};
export type TerminateSessionModalForProjectAdminMutation$variables = {
  input: PartialBulkTerminateSessionsInput;
};
export type TerminateSessionModalForProjectAdminMutation$data = {
  readonly partialBulkTerminateSessionsV2: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly id: string;
    }>;
  };
};
export type TerminateSessionModalForProjectAdminMutation = {
  response: TerminateSessionModalForProjectAdminMutation$data;
  variables: TerminateSessionModalForProjectAdminMutation$variables;
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
    "concreteType": "PartialBulkTerminateSessionsPayload",
    "kind": "LinkedField",
    "name": "partialBulkTerminateSessionsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "SessionTerminationInfo",
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
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "813ed9b29eaf96d4b79345999ddd9b4a",
    "id": null,
    "metadata": {},
    "name": "TerminateSessionModalForProjectAdminMutation",
    "operationKind": "mutation",
    "text": "mutation TerminateSessionModalForProjectAdminMutation(\n  $input: PartialBulkTerminateSessionsInput!\n) {\n  partialBulkTerminateSessionsV2(input: $input) {\n    successes {\n      id\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c40238a78ac4d415a26d0857ec09d7f";

export default node;
