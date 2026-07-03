/**
 * @generated SignedSource<<c120f951336c49b0b9d7eb23f412fd77>>
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
export type ModifySessionModalMutation$variables = {
  input: ModifyComputeSessionInput;
};
export type ModifySessionModalMutation$data = {
  readonly modify_compute_session: {
    readonly item: {
      readonly id: string;
      readonly name: string | null | undefined;
      readonly priority: number | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type ModifySessionModalMutation = {
  response: ModifySessionModalMutation$data;
  variables: ModifySessionModalMutation$variables;
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
            "name": "name",
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
    "name": "ModifySessionModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ModifySessionModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "dd4c449546cdc3a9941675480b8640ba",
    "id": null,
    "metadata": {},
    "name": "ModifySessionModalMutation",
    "operationKind": "mutation",
    "text": "mutation ModifySessionModalMutation(\n  $input: ModifyComputeSessionInput!\n) {\n  modify_compute_session(input: $input) {\n    item {\n      id\n      name\n      priority\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e26c9f14da7d96ee1ea8061afe67e44f";

export default node;
