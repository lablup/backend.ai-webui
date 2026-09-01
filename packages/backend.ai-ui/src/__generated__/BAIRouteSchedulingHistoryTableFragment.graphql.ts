/**
 * @generated SignedSource<<dbec63862c8e832e12c816fb9071797b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIRouteSchedulingHistoryTableFragment$data = ReadonlyArray<{
  readonly id: string;
  readonly phase: string;
  readonly result: SchedulingResult;
  readonly subSteps: ReadonlyArray<{
    readonly step: string;
    readonly " $fragmentSpreads": FragmentRefs<"BAISubStepNodesFragment">;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryNodeTableFragment">;
  readonly " $fragmentType": "BAIRouteSchedulingHistoryTableFragment";
}>;
export type BAIRouteSchedulingHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIRouteSchedulingHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRouteSchedulingHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIRouteSchedulingHistoryTableFragment",
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
      "name": "phase",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "result",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SubStepResultGQL",
      "kind": "LinkedField",
      "name": "subSteps",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "step",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "BAISubStepNodesFragment"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIRouteSchedulingHistoryNodeTableFragment"
    }
  ],
  "type": "RouteHistory",
  "abstractKey": null
};

(node as any).hash = "fb72214c9f69e04160057fd7338e8ea7";

export default node;
