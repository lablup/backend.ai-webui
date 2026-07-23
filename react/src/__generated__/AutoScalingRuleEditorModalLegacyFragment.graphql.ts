/**
 * @generated SignedSource<<652326e4c9608690c0889c3772df44cc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type AutoScalingMetricComparator = "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "%future added value";
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AutoScalingRuleEditorModalLegacyFragment$data = {
  readonly comparator: AutoScalingMetricComparator;
  readonly cooldown_seconds: number;
  readonly endpoint: string;
  readonly id: string;
  readonly max_replicas: number | null | undefined;
  readonly metric_name: string;
  readonly metric_source: AutoScalingMetricSource;
  readonly min_replicas: number | null | undefined;
  readonly step_size: number;
  readonly threshold: string;
  readonly " $fragmentType": "AutoScalingRuleEditorModalLegacyFragment";
};
export type AutoScalingRuleEditorModalLegacyFragment$key = {
  readonly " $data"?: AutoScalingRuleEditorModalLegacyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleEditorModalLegacyFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AutoScalingRuleEditorModalLegacyFragment",
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
      "name": "endpoint",
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
  "type": "EndpointAutoScalingRuleNode",
  "abstractKey": null
};

(node as any).hash = "ad229661c1ec2984155d3e78fd3560c2";

export default node;
