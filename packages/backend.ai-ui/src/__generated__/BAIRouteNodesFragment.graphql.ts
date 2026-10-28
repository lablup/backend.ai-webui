/**
 * @generated SignedSource<<1b450cfc42dbb835e589cf96f1f6528c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RouteHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type RouteStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type RouteTrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIRouteNodesFragment$data = ReadonlyArray<{
  readonly createdAt: string | null | undefined;
  readonly errorData: any | null | undefined;
  readonly fieldId: string;
  readonly healthStatus: RouteHealthStatus;
  readonly id: string;
  readonly session: string | null | undefined;
  readonly status: RouteStatus;
  readonly trafficRatio: number;
  readonly trafficStatus: RouteTrafficStatus;
  readonly " $fragmentType": "BAIRouteNodesFragment";
}>;
export type BAIRouteNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIRouteNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRouteNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIRouteNodesFragment",
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
      "name": "fieldId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "healthStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "trafficRatio",
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
      "name": "errorData",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "session",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "trafficStatus",
      "storageKey": null
    }
  ],
  "type": "Route",
  "abstractKey": null
};

(node as any).hash = "a6e1689e7bc4ba057f63729f0afd28d0";

export default node;
