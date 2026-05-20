/**
 * @generated SignedSource<<1b8d339814e113c04e729276971bfc2d>>
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
export type PrometheusQueryPresetEditorModalCreateMutation$variables = {
  input: CreateQueryDefinitionInput;
};
export type PrometheusQueryPresetEditorModalCreateMutation$data = {
  readonly adminCreatePrometheusQueryPreset: {
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
export type PrometheusQueryPresetEditorModalCreateMutation = {
  response: PrometheusQueryPresetEditorModalCreateMutation$data;
  variables: PrometheusQueryPresetEditorModalCreateMutation$variables;
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
    "name": "PrometheusQueryPresetEditorModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PrometheusQueryPresetEditorModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "241a2344aec77583c21c3d470d065930",
    "id": null,
    "metadata": {},
    "name": "PrometheusQueryPresetEditorModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation PrometheusQueryPresetEditorModalCreateMutation(\n  $input: CreateQueryDefinitionInput!\n) {\n  adminCreatePrometheusQueryPreset(input: $input) {\n    preset {\n      id\n      name\n      description\n      rank\n      categoryId\n      metricName\n      queryTemplate\n      timeWindow\n      options {\n        filterLabels\n        groupLabels\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "36e9234ee0100aafb9f6a723dfe79f05";

export default node;
