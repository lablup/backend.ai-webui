/**
 * @generated SignedSource<<4a85191708aec5ae0aa458a988789344>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RetentionPolicySettingModalFragment$data = {
  readonly category: RetentionCategory;
  readonly enabled: boolean;
  readonly id: string;
  readonly retentionPeriodDays: number;
  readonly " $fragmentType": "RetentionPolicySettingModalFragment";
};
export type RetentionPolicySettingModalFragment$key = {
  readonly " $data"?: RetentionPolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RetentionPolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RetentionPolicySettingModalFragment",
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
      "name": "category",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "retentionPeriodDays",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "enabled",
      "storageKey": null
    }
  ],
  "type": "RetentionPolicy",
  "abstractKey": null
};

(node as any).hash = "c23a19780fbbb4f9c2d02c62f92095c1";

export default node;
