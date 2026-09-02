/**
 * @generated SignedSource<<e69842c1a4f49f45038e2a2927630bef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AutoScalingRuleListNodesFragment$data = ReadonlyArray<{
  readonly createdAt: string;
  readonly id: string;
  readonly lastTriggeredAt: string | null | undefined;
  readonly maxReplicas: number | null | undefined;
  readonly maxThreshold: any | null | undefined;
  readonly metricName: string;
  readonly metricSource: AutoScalingMetricSource;
  readonly minReplicas: number | null | undefined;
  readonly minThreshold: any | null | undefined;
  readonly prometheusQueryPresetId: string | null | undefined;
  readonly stepSize: number;
  readonly timeWindow: number;
  readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleEditorModalFragment">;
  readonly " $fragmentType": "AutoScalingRuleListNodesFragment";
} | null | undefined>;
export type AutoScalingRuleListNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: AutoScalingRuleListNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleListNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "AutoScalingRuleListNodesFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastTriggeredAt",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AutoScalingRuleEditorModalFragment"
    }
  ],
  "type": "AutoScalingRule",
  "abstractKey": null
};

(node as any).hash = "54a32b764fc7e506f5bddfe218691cd2";

export default node;
