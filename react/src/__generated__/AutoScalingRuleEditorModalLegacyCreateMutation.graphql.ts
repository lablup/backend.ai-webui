/**
 * @generated SignedSource<<98a89b4e6560cafa58bdb48ff2823fb3>>
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msg",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metric_name",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metric_source",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "threshold",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "comparator",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "step_size",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cooldown_seconds",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min_replicas",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_replicas",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateEndpointAutoScalingRuleNode",
        "kind": "LinkedField",
        "name": "create_endpoint_auto_scaling_rule_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointAutoScalingRuleNode",
            "kind": "LinkedField",
            "name": "rule",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateEndpointAutoScalingRuleNode",
        "kind": "LinkedField",
        "name": "create_endpoint_auto_scaling_rule_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointAutoScalingRuleNode",
            "kind": "LinkedField",
            "name": "rule",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "279e7a79b6dddb55c0e08817423897f3",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalLegacyCreateMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalLegacyCreateMutation(\n  $endpoint: String!\n  $props: EndpointAutoScalingRuleInput!\n) {\n  create_endpoint_auto_scaling_rule_node(endpoint: $endpoint, props: $props) {\n    ok\n    msg\n    rule {\n      metric_name\n      metric_source\n      threshold\n      comparator\n      step_size\n      cooldown_seconds\n      min_replicas\n      max_replicas\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "78201efd1b6d233552d9a15a5db3d754";

export default node;
