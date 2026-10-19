/**
 * @generated SignedSource<<70a771c0e7fc7e0477274ca224b2a79b>>
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
    readonly id: string;
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
    "concreteType": "DeleteQueryDefinitionPayload",
    "kind": "LinkedField",
    "name": "purgePrometheusQueryPreset",
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
    "cacheID": "5cbd958610149bd479776f5c2cab1fd1",
    "id": null,
    "metadata": {},
    "name": "AdminPrometheusPresetDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminPrometheusPresetDeleteMutation(\n  $id: UUID!\n) {\n  purgePrometheusQueryPreset(id: $id) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "f2619a406e0fb05cb29124bba29a5547";

export default node;
