/**
 * @generated SignedSource<<9493962746decc26dd8c780bee89b98c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
export type UpdateAutoScalingRuleInput = {
  id: string;
  maxReplicas?: number | null | undefined;
  maxThreshold?: any | null | undefined;
  metricName?: string | null | undefined;
  metricSource?: AutoScalingMetricSource | null | undefined;
  minReplicas?: number | null | undefined;
  minThreshold?: any | null | undefined;
  prometheusQueryPresetId?: string | null | undefined;
  stepSize?: number | null | undefined;
  timeWindow?: number | null | undefined;
};
export type AutoScalingRuleEditorModalUpdateMutation$variables = {
  input: UpdateAutoScalingRuleInput;
};
export type AutoScalingRuleEditorModalUpdateMutation$data = {
  readonly updateAutoScalingRule: {
    readonly rule: {
      readonly id: string;
      readonly maxReplicas: number | null | undefined;
      readonly maxThreshold: any | null | undefined;
      readonly metricName: string;
      readonly metricSource: AutoScalingMetricSource;
      readonly minReplicas: number | null | undefined;
      readonly minThreshold: any | null | undefined;
      readonly prometheusQueryPresetId: string | null | undefined;
      readonly stepSize: number;
      readonly timeWindow: number;
    };
  } | null | undefined;
};
export type AutoScalingRuleEditorModalUpdateMutation = {
  response: AutoScalingRuleEditorModalUpdateMutation$data;
  variables: AutoScalingRuleEditorModalUpdateMutation$variables;
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
    "concreteType": "UpdateAutoScalingRulePayload",
    "kind": "LinkedField",
    "name": "updateAutoScalingRule",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AutoScalingRule",
        "kind": "LinkedField",
        "name": "rule",
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
            "name": "metricSource",
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
            "name": "minThreshold",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxThreshold",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "stepSize",
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
            "kind": "ScalarField",
            "name": "minReplicas",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxReplicas",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "prometheusQueryPresetId",
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
    "name": "AutoScalingRuleEditorModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f5194bd994f4693e29536fec36e4f0e4",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalUpdateMutation(\n  $input: UpdateAutoScalingRuleInput!\n) {\n  updateAutoScalingRule(input: $input) {\n    rule {\n      id\n      metricSource\n      metricName\n      minThreshold\n      maxThreshold\n      stepSize\n      timeWindow\n      minReplicas\n      maxReplicas\n      prometheusQueryPresetId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e953443e1aa963b955810e5f97de017";

export default node;
