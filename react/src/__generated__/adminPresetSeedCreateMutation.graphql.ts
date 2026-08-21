/**
 * @generated SignedSource<<c56fa60f843f9cb100d8fe37daa8b25b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateQueryDefinitionInput = {
  categoryId?: string | null | undefined;
  description?: string | null | undefined;
  metricName: string;
  name: string;
  options: QueryDefinitionOptionsInput;
  queryTemplate: string;
  rank?: number;
  timeWindow?: string | null | undefined;
};
export type QueryDefinitionOptionsInput = {
  filterLabels: ReadonlyArray<string>;
  groupLabels: ReadonlyArray<string>;
};
export type adminPresetSeedCreateMutation$variables = {
  input: CreateQueryDefinitionInput;
};
export type adminPresetSeedCreateMutation$data = {
  readonly adminCreatePrometheusQueryPreset: {
    readonly preset: {
      readonly id: string;
      readonly name: string;
    };
  } | null | undefined;
};
export type adminPresetSeedCreateMutation = {
  response: adminPresetSeedCreateMutation$data;
  variables: adminPresetSeedCreateMutation$variables;
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
    "concreteType": "CreateQueryDefinitionPayload",
    "kind": "LinkedField",
    "name": "adminCreatePrometheusQueryPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "QueryDefinition",
        "kind": "LinkedField",
        "name": "preset",
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
    "name": "adminPresetSeedCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "adminPresetSeedCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "43b027b015f9e25a7fc351b45710b7a4",
    "id": null,
    "metadata": {},
    "name": "adminPresetSeedCreateMutation",
    "operationKind": "mutation",
    "text": "mutation adminPresetSeedCreateMutation(\n  $input: CreateQueryDefinitionInput!\n) {\n  adminCreatePrometheusQueryPreset(input: $input) {\n    preset {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bde1cb87f5a2dd38db7576b75bebdec1";

export default node;
