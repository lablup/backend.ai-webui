/**
 * @generated SignedSource<<c05fc7782d087350e8c65d29d914aa26>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupSchedulerTypeAlertFragment$data = {
  readonly name: string;
  readonly scheduler: {
    readonly type: SchedulerType;
  };
  readonly " $fragmentType": "ResourceGroupSchedulerTypeAlertFragment";
};
export type ResourceGroupSchedulerTypeAlertFragment$key = {
  readonly " $data"?: ResourceGroupSchedulerTypeAlertFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupSchedulerTypeAlertFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupSchedulerTypeAlertFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
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
    }
  ],
  "type": "ResourceGroup",
  "abstractKey": null
};

(node as any).hash = "576f585c9f1465f6a5a715b631fdfda8";

export default node;
