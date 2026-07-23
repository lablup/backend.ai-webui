/**
 * @generated SignedSource<<d6a85f1a8f51405f2699328200588f22>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AutoScalingRuleEditorModalFragment$data = {
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
  readonly " $fragmentType": "AutoScalingRuleEditorModalFragment";
};
export type AutoScalingRuleEditorModalFragment$key = {
  readonly " $data"?: AutoScalingRuleEditorModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleEditorModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AutoScalingRuleEditorModalFragment",
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
  "type": "AutoScalingRule",
  "abstractKey": null
};

(node as any).hash = "9dff1f6ce3b17626029eee3484220a7d";

export default node;
