/**
 * @generated SignedSource<<eea55ad6641ed70db9e1736720d4fe3d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingMetricComparator = "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "%future added value";
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
export type EndpointAutoScalingRuleInput = {
  comparator: AutoScalingMetricComparator;
  cooldown_seconds: number;
  max_replicas?: number | null | undefined;
  metric_name: string;
  metric_source: AutoScalingMetricSource;
  min_replicas?: number | null | undefined;
  step_size: number;
  threshold: string;
};
export type AutoScalingRuleEditorModalLegacyCreateMutation$variables = {
  endpoint: string;
  props: EndpointAutoScalingRuleInput;
};
export type AutoScalingRuleEditorModalLegacyCreateMutation$data = {
  readonly create_endpoint_auto_scaling_rule_node: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
    readonly rule: {
      readonly comparator: AutoScalingMetricComparator;
      readonly cooldown_seconds: number;
      readonly id: string;
      readonly max_replicas: number | null | undefined;
      readonly metric_name: string;
      readonly metric_source: AutoScalingMetricSource;
      readonly min_replicas: number | null | undefined;
      readonly step_size: number;
      readonly threshold: string;
    } | null | undefined;
  } | null | undefined;
};
export type AutoScalingRuleEditorModalLegacyCreateMutation = {
  response: AutoScalingRuleEditorModalLegacyCreateMutation$data;
  variables: AutoScalingRuleEditorModalLegacyCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpoint"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "endpoint",
        "variableName": "endpoint"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "CreateEndpointAutoScalingRuleNode",
    "kind": "LinkedField",
    "name": "create_endpoint_auto_scaling_rule_node",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "EndpointAutoScalingRuleNode",
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
            "name": "metric_name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "metric_source",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "threshold",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "comparator",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "step_size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cooldown_seconds",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "min_replicas",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_replicas",
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
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d6787a335648860ccaed370f68e68adb",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalLegacyCreateMutation(\n  $endpoint: String!\n  $props: EndpointAutoScalingRuleInput!\n) {\n  create_endpoint_auto_scaling_rule_node(endpoint: $endpoint, props: $props) {\n    ok\n    msg\n    rule {\n      id\n      metric_name\n      metric_source\n      threshold\n      comparator\n      step_size\n      cooldown_seconds\n      min_replicas\n      max_replicas\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef55613ef78e1c4f2c4df9a728641978";

export default node;
