/**
 * @generated SignedSource<<a2a1dddefbcec0c213aca42b4ab8af89>>
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
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyEndpointAutoScalingRuleNode",
        "kind": "LinkedField",
        "name": "modify_endpoint_auto_scaling_rule_node",
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
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyEndpointAutoScalingRuleNode",
        "kind": "LinkedField",
        "name": "modify_endpoint_auto_scaling_rule_node",
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
    "cacheID": "027d83c53e1eff57ebb76cbd6bd9fc03",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalLegacyModifyMutation",
    "operationKind": "mutation",
    "text": "mutation AutoScalingRuleEditorModalLegacyModifyMutation(\n  $id: String!\n  $props: ModifyEndpointAutoScalingRuleInput!\n) {\n  modify_endpoint_auto_scaling_rule_node(id: $id, props: $props) {\n    ok\n    msg\n    rule {\n      metric_name\n      metric_source\n      threshold\n      comparator\n      step_size\n      cooldown_seconds\n      min_replicas\n      max_replicas\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dc4f4cf0c80099d59b5c06e4b2e3ed16";

export default node;
