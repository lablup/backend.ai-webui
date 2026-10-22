/**
 * @generated SignedSource<<9cdd2e1d37a66033d165eb4d28c990cb>>
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
  readonly purgePrometheusQueryPreset: {
    readonly entityId: string;
  };
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
    "concreteType": "PurgeQueryDefinitionPayload",
    "kind": "LinkedField",
    "name": "purgePrometheusQueryPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "entityId",
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
    "cacheID": "9bc2796d59cc27fefa282504d95dbd82",
    "id": null,
    "metadata": {},
    "name": "AdminPrometheusPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminPrometheusPresetDeleteMutation(\n  $id: UUID!\n) {\n  purgePrometheusQueryPreset(id: $id) {\n    entityId\n  }\n}\n"
  }
};
})();

(node as any).hash = "483a510645da7ea069d27a975f9739d5";

export default node;
