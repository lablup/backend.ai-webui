/**
 * @generated SignedSource<<d841ac1836da98a4c2062394fd09af15>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyComputeSessionInput = {
  clientMutationId?: string | null | undefined;
  id: any;
  name?: string | null | undefined;
  priority?: number | null | undefined;
};
export type EditSessionPriorityModalMutation$variables = {
  input: ModifyComputeSessionInput;
};
export type EditSessionPriorityModalMutation$data = {
  readonly modify_compute_session: {
    readonly item: {
      readonly id: string;
      readonly priority: number | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type EditSessionPriorityModalMutation = {
  response: EditSessionPriorityModalMutation$data;
  variables: EditSessionPriorityModalMutation$variables;
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
    "concreteType": "ModifyComputeSessionPayload",
    "kind": "LinkedField",
    "name": "modify_compute_session",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "priority",
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
    "name": "EditSessionPriorityModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditSessionPriorityModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "692d97a4eb52796692ac3af348a0b004",
    "id": null,
    "metadata": {},
    "name": "EditSessionPriorityModalMutation",
    "operationKind": "mutation",
    "text": "mutation EditSessionPriorityModalMutation(\n  $input: ModifyComputeSessionInput!\n) {\n  modify_compute_session(input: $input) {\n    item {\n      id\n      priority @since(version: \"24.09.0\")\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2656f79687d0c72d1df9010e92042076";

export default node;
