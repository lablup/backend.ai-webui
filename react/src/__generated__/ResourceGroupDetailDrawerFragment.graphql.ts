/**
 * @generated SignedSource<<b6c523f342daaee02d060f06955524a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDetailDrawerFragment$data = {
  readonly metadata: {
    readonly createdAt: string;
    readonly description: string | null | undefined;
  };
  readonly name: string;
  readonly network: {
    readonly wsproxyAddr: string | null | undefined;
  };
  readonly scheduler: {
    readonly type: SchedulerType;
  };
  readonly status: {
    readonly isActive: boolean;
    readonly isPublic: boolean;
  };
  readonly " $fragmentType": "ResourceGroupDetailDrawerFragment";
};
export type ResourceGroupDetailDrawerFragment$key = {
  readonly " $data"?: ResourceGroupDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDetailDrawerFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDetailDrawerFragment",
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
      "concreteType": "ResourceGroupStatus",
      "kind": "LinkedField",
      "name": "status",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isActive",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isPublic",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceGroupMetadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "createdAt",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceGroupNetworkConfig",
      "kind": "LinkedField",
      "name": "network",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "wsproxyAddr",
          "storageKey": null
        }
      ],
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

(node as any).hash = "442ec3eb9856eb5bf18ce2bad741c929";

export default node;
