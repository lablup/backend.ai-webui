/**
 * @generated SignedSource<<14d0ea0149b7d8dcb6253ef5b841d1f4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteDeploymentInput = {
  id: string;
};
export type WebUIAssistantTurnOffModalDeleteMutation$variables = {
  input: DeleteDeploymentInput;
};
export type WebUIAssistantTurnOffModalDeleteMutation$data = {
  readonly deleteModelDeployment: {
    readonly id: string;
  } | null | undefined;
};
export type WebUIAssistantTurnOffModalDeleteMutation = {
  response: WebUIAssistantTurnOffModalDeleteMutation$data;
  variables: WebUIAssistantTurnOffModalDeleteMutation$variables;
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
    "concreteType": "DeleteDeploymentPayload",
    "kind": "LinkedField",
    "name": "deleteModelDeployment",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
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
    "name": "WebUIAssistantTurnOffModalDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "WebUIAssistantTurnOffModalDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9ba1b3cc8a1f014418e9d23155883964",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantTurnOffModalDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation WebUIAssistantTurnOffModalDeleteMutation(\n  $input: DeleteDeploymentInput!\n) {\n  deleteModelDeployment(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ae38e74b3f2a057c45c1207e0d0ae723";

export default node;
