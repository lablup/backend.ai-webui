/**
 * @generated SignedSource<<986a38da34e631ace75db7db301f87b4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RetentionCategory = "DEPLOYMENTS" | "LOGIN" | "LOGS" | "RECONCILE_HISTORY" | "ROLES_INVITATIONS" | "SESSIONS" | "USAGE_BUCKETS" | "USAGE_RECORDS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIAdminRetentionPolicyTableFragment$data = ReadonlyArray<{
  readonly category: RetentionCategory;
  readonly createdAt: string;
  readonly enabled: boolean;
  readonly entityId: string;
  readonly id: string;
  readonly lastSweptAt: string | null | undefined;
  readonly retentionPeriodDays: number;
  readonly updatedAt: string;
  readonly " $fragmentType": "BAIAdminRetentionPolicyTableFragment";
}>;
export type BAIAdminRetentionPolicyTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIAdminRetentionPolicyTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAdminRetentionPolicyTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIAdminRetentionPolicyTableFragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastSweptAt",
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
      "name": "updatedAt",
      "storageKey": null
    }
  ],
  "type": "RetentionPolicy",
  "abstractKey": null
};

(node as any).hash = "3058167d1997c0ede8ede1816f778dae";

export default node;
