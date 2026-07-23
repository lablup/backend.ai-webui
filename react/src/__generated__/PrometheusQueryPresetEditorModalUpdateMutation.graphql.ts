/**
 * @generated SignedSource<<8273fa80a0a9d04479459a298281cbfc>>
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
export type PrometheusQueryPresetEditorModalUpdateMutation$variables = {
  id: string;
  input: ModifyQueryDefinitionInput;
};
export type PrometheusQueryPresetEditorModalUpdateMutation$data = {
  readonly adminModifyPrometheusQueryPreset: {
    readonly preset: {
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
    };
  } | null | undefined;
};
export type PrometheusQueryPresetEditorModalUpdateMutation = {
  response: PrometheusQueryPresetEditorModalUpdateMutation$data;
  variables: PrometheusQueryPresetEditorModalUpdateMutation$variables;
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
v1 = [
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
    "name": "PrometheusQueryPresetEditorModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PrometheusQueryPresetEditorModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1c8c8b3b74fc622ca8886afd8905d5bd",
    "id": null,
    "metadata": {},
    "name": "PrometheusQueryPresetEditorModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation PrometheusQueryPresetEditorModalUpdateMutation(\n  $id: ID!\n  $input: ModifyQueryDefinitionInput!\n) {\n  adminModifyPrometheusQueryPreset(id: $id, input: $input) {\n    preset {\n      id\n      name\n      description\n      rank\n      categoryId\n      metricName\n      queryTemplate\n      timeWindow\n      options {\n        filterLabels\n        groupLabels\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "da8459808883cdd50d75428c02c26b59";

export default node;
