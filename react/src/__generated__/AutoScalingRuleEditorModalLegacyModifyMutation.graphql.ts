/**
 * @generated SignedSource<<f84dfaa7f4ca00b97b12458a79a62840>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingMetricComparator = "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "%future added value";
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
export type ModifyEndpointAutoScalingRuleInput = {
  comparator?: AutoScalingMetricComparator | null | undefined;
  cooldown_seconds?: number | null | undefined;
  max_replicas?: number | null | undefined;
  metric_name?: string | null | undefined;
  metric_source?: AutoScalingMetricSource | null | undefined;
  min_replicas?: number | null | undefined;
  step_size?: number | null | undefined;
  threshold?: string | null | undefined;
};
export type AutoScalingRuleEditorModalLegacyModifyMutation$variables = {
  id: string;
  props: ModifyEndpointAutoScalingRuleInput;
};
export type AutoScalingRuleEditorModalLegacyModifyMutation$data = {
  readonly modify_endpoint_auto_scaling_rule_node: {
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
export type AutoScalingRuleEditorModalLegacyModifyMutation = {
  response: AutoScalingRuleEditorModalLegacyModifyMutation$data;
  variables: AutoScalingRuleEditorModalLegacyModifyMutation$variables;
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
    "name": "props"
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
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyEndpointAutoScalingRuleNode",
    "kind": "LinkedField",
    "name": "modify_endpoint_auto_scaling_rule_node",
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
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d615856c9e6a08ad1f16d3133ee4c998",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalLegacyModifyMutation(\n  $id: String!\n  $props: ModifyEndpointAutoScalingRuleInput!\n) {\n  modify_endpoint_auto_scaling_rule_node(id: $id, props: $props) {\n    ok\n    msg\n    rule {\n      id\n      metric_name\n      metric_source\n      threshold\n      comparator\n      step_size\n      cooldown_seconds\n      min_replicas\n      max_replicas\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fb85ee35b9bdd738cb1a22f3a7c6935d";

export default node;
