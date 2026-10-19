/**
 * @generated SignedSource<<c994ce53fb60a1f4ea1d8e2ec77005d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminPrometheusPresetLegacyDeleteMutation$variables = {
  id: string;
};
export type AdminPrometheusPresetLegacyDeleteMutation$data = {
  readonly adminDeletePrometheusQueryPreset: {
    readonly id: string;
  } | null | undefined;
};
export type AdminPrometheusPresetLegacyDeleteMutation = {
  response: AdminPrometheusPresetLegacyDeleteMutation$data;
  variables: AdminPrometheusPresetLegacyDeleteMutation$variables;
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
    "name": "AdminPrometheusPresetLegacyDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminPrometheusPresetLegacyDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "86062b2cba7bb3c42be6bc032555978d",
    "id": null,
    "metadata": {},
    "name": "AdminPrometheusPresetLegacyDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminPrometheusPresetLegacyDeleteMutation(\n  $id: ID!\n) {\n  adminDeletePrometheusQueryPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e21289355a59f510d9bb761d732e6fe";

export default node;
