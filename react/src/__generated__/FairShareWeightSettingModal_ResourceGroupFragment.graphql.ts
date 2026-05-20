/**
 * @generated SignedSource<<e0dece15221821b8ea5a04df2ac0a05f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type FairShareWeightSettingModal_ResourceGroupFragment$data = {
  readonly name: string;
  readonly scheduler: {
    readonly type: SchedulerType;
  };
  readonly " $fragmentType": "FairShareWeightSettingModal_ResourceGroupFragment";
};
export type FairShareWeightSettingModal_ResourceGroupFragment$key = {
  readonly " $data"?: FairShareWeightSettingModal_ResourceGroupFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FairShareWeightSettingModal_ResourceGroupFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FairShareWeightSettingModal_ResourceGroupFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceGroupSchedulerConfig",
      "kind": "LinkedField",
      "name": "scheduler",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "86fa5bf0deb6f435da984a84abe6d9f1";

export default node;
