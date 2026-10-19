/**
 * @generated SignedSource<<a6486f7c7f819c12b7d73fd6fe182cce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyQueryDefinitionInput = {
  categoryId?: string | null | undefined;
  description?: string | null | undefined;
  metricName?: string | null | undefined;
  name?: string | null | undefined;
  options?: ModifyQueryDefinitionOptionsInput | null | undefined;
  queryTemplate?: string | null | undefined;
  rank?: number | null | undefined;
  timeWindow?: string | null | undefined;
};
export type ModifyQueryDefinitionOptionsInput = {
  filterLabels?: ReadonlyArray<string> | null | undefined;
  groupLabels?: ReadonlyArray<string> | null | undefined;
};
export type PrometheusQueryPresetEditorModalLegacyUpdateMutation$variables = {
  id: string;
  input: ModifyQueryDefinitionInput;
};
export type PrometheusQueryPresetEditorModalLegacyUpdateMutation$data = {
  readonly adminModifyPrometheusQueryPreset: {
    readonly preset: {
      readonly category: {
        readonly id: string;
        readonly name: string;
      } | null | undefined;
      readonly categoryId: string | null | undefined;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly metricName: string;
      readonly name: string;
      readonly options: {
        readonly filterLabels: ReadonlyArray<string>;
        readonly groupLabels: ReadonlyArray<string>;
      };
      readonly queryTemplate: string;
      readonly rank: number;
      readonly timeWindow: string | null | undefined;
      readonly updatedAt: string;
    };
  } | null | undefined;
};
export type PrometheusQueryPresetEditorModalLegacyUpdateMutation = {
  response: PrometheusQueryPresetEditorModalLegacyUpdateMutation$data;
  variables: PrometheusQueryPresetEditorModalLegacyUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ModifyQueryDefinitionPayload",
    "kind": "LinkedField",
    "name": "adminModifyPrometheusQueryPreset",
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
          (v1/*: any*/),
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rank",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "categoryId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "metricName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "queryTemplate",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "timeWindow",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinitionOptions",
            "kind": "LinkedField",
            "name": "options",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "filterLabels",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "groupLabels",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryPresetCategory",
            "kind": "LinkedField",
            "name": "category",
            "plural": false,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
            ],
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
    "name": "PrometheusQueryPresetEditorModalLegacyUpdateMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PrometheusQueryPresetEditorModalLegacyUpdateMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "9e3268b382867f676956fdb47bfd6caf",
    "id": null,
    "metadata": {},
    "name": "PrometheusQueryPresetEditorModalLegacyUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation PrometheusQueryPresetEditorModalLegacyUpdateMutation(\n  $id: ID!\n  $input: ModifyQueryDefinitionInput!\n) {\n  adminModifyPrometheusQueryPreset(id: $id, input: $input) {\n    preset {\n      id\n      name\n      description\n      rank\n      categoryId\n      metricName\n      queryTemplate\n      timeWindow\n      options {\n        filterLabels\n        groupLabels\n      }\n      updatedAt\n      category {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ec6b19b1491daaeb8dda369f28d2a055";

export default node;
