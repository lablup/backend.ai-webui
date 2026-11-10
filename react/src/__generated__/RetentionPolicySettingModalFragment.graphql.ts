/**
 * @generated SignedSource<<716df84e6bead4704bf880f5c87f0712>>
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
  readonly entityId: string;
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
      "name": "entityId",
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

(node as any).hash = "2082d788318060d3774debc845ed09f1";

export default node;
