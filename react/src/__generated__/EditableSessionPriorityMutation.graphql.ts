/**
 * @generated SignedSource<<2010b94487f876140be25f2e546ef6c4>>
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
export type EditableSessionPriorityMutation$variables = {
  input: ModifyComputeSessionInput;
};
export type EditableSessionPriorityMutation$data = {
  readonly modify_compute_session: {
    readonly item: {
      readonly id: string;
      readonly priority: number | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type EditableSessionPriorityMutation = {
  response: EditableSessionPriorityMutation$data;
  variables: EditableSessionPriorityMutation$variables;
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
    "name": "EditableSessionPriorityMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditableSessionPriorityMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0619ada4837434d86fa54501f653617e",
    "id": null,
    "metadata": {},
    "name": "EditableSessionPriorityMutation",
    "operationKind": "mutation",
    "text": "mutation EditableSessionPriorityMutation(\n  $input: ModifyComputeSessionInput!\n) {\n  modify_compute_session(input: $input) {\n    item {\n      id\n      priority\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4f53dd5dc2d3adf7a2c73d80cf5b76a4";

export default node;
