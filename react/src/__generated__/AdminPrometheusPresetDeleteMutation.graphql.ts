/**
 * @generated SignedSource<<5c2bf73ca54fe57875c562e3a071fbd3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminPrometheusPresetDeleteMutation$variables = {
  id: string;
};
export type AdminPrometheusPresetDeleteMutation$data = {
  readonly adminDeletePrometheusQueryPreset: {
    readonly id: string;
  } | null | undefined;
};
export type AdminPrometheusPresetDeleteMutation = {
  response: AdminPrometheusPresetDeleteMutation$data;
  variables: AdminPrometheusPresetDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "DeleteQueryDefinitionPayload",
    "kind": "LinkedField",
    "name": "adminDeletePrometheusQueryPreset",
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
    "name": "AdminPrometheusPresetDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminPrometheusPresetDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b36af27d5e2d8eb384beacc072fda555",
    "id": null,
    "metadata": {},
    "name": "AdminPrometheusPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminPrometheusPresetDeleteMutation(\n  $id: ID!\n) {\n  adminDeletePrometheusQueryPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "83b31f89a1ea2a1e314fa98a8be6a6df";

export default node;
