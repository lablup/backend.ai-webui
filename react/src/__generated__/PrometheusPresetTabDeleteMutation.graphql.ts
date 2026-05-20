/**
 * @generated SignedSource<<aeac13974911866c4f620592b52ecb86>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PrometheusPresetTabDeleteMutation$variables = {
  id: string;
};
export type PrometheusPresetTabDeleteMutation$data = {
  readonly adminDeletePrometheusQueryPreset: {
    readonly id: string;
  } | null | undefined;
};
export type PrometheusPresetTabDeleteMutation = {
  response: PrometheusPresetTabDeleteMutation$data;
  variables: PrometheusPresetTabDeleteMutation$variables;
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
    "name": "PrometheusPresetTabDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PrometheusPresetTabDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "935b661e74d3b19998c03edb04064cbb",
    "id": null,
    "metadata": {},
    "name": "PrometheusPresetTabDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation PrometheusPresetTabDeleteMutation(\n  $id: ID!\n) {\n  adminDeletePrometheusQueryPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "35c4c5d3701db82305c38c36c1375003";

export default node;
