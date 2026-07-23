/**
 * @generated SignedSource<<d117dc7726ec7d663c18a19dce5d6121>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
export type CreateAutoScalingRuleInput = {
  maxReplicas?: number | null | undefined;
  maxThreshold?: any | null | undefined;
  metricName: string;
  metricSource: AutoScalingMetricSource;
  minReplicas?: number | null | undefined;
  minThreshold?: any | null | undefined;
  modelDeploymentId: string;
  prometheusQueryPresetId?: string | null | undefined;
  stepSize: number;
  timeWindow: number;
};
export type AutoScalingRuleEditorModalCreateMutation$variables = {
  input: CreateAutoScalingRuleInput;
};
export type AutoScalingRuleEditorModalCreateMutation$data = {
  readonly createAutoScalingRule: {
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
export type AutoScalingRuleEditorModalCreateMutation = {
  response: AutoScalingRuleEditorModalCreateMutation$data;
  variables: AutoScalingRuleEditorModalCreateMutation$variables;
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
    "concreteType": "CreateAutoScalingRulePayload",
    "kind": "LinkedField",
    "name": "createAutoScalingRule",
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
    "name": "AutoScalingRuleEditorModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c7c250dabfc49b66cf1aebbff6414d44",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalCreateMutation(\n  $input: CreateAutoScalingRuleInput!\n) {\n  createAutoScalingRule(input: $input) {\n    rule {\n      id\n      metricSource\n      metricName\n      minThreshold\n      maxThreshold\n      stepSize\n      timeWindow\n      minReplicas\n      maxReplicas\n      prometheusQueryPresetId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7afa475334295923b7754d0563a8b919";

export default node;
