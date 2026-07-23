/**
 * @generated SignedSource<<391ec00f9b38a25a79c578a9293b8ffe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAINodeNotificationItemFragment$data = {
  readonly __typename: "ComputeSessionNode";
  readonly id: string;
  readonly name?: string | null | undefined;
  readonly row_id?: string | null | undefined;
  readonly sessionFrgmt?: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIComputeSessionNodeNotificationItemFragment">;
  } | null | undefined;
  readonly status?: string | null | undefined;
  readonly vfolderFrgmt?: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIVirtualFolderNodeNotificationItemV2Fragment">;
  } | null | undefined;
  readonly virtualFolderNodeFrgmt?: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIVirtualFolderNodeNotificationItemFragment">;
  } | null | undefined;
  readonly " $fragmentType": "BAINodeNotificationItemFragment";
};
export type BAINodeNotificationItemFragment$key = {
  readonly " $data"?: BAINodeNotificationItemFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAINodeNotificationItemFragment">;
};

import BAINodeNotificationItemRefetchQuery_graphql from './BAINodeNotificationItemRefetchQuery.graphql';

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": BAINodeNotificationItemRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "BAINodeNotificationItemFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
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
          "kind": "ScalarField",
          "name": "row_id",
          "storageKey": null
        },
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "BAIComputeSessionNodeNotificationItemFragment"
              }
            ],
            "type": "ComputeSessionNode",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "sessionFrgmt"
        }
      ],
      "type": "ComputeSessionNode",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "BAIVirtualFolderNodeNotificationItemV2Fragment"
              }
            ],
            "type": "VFolder",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "vfolderFrgmt"
        }
      ],
      "type": "VFolder",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "fragment": {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "BAIVirtualFolderNodeNotificationItemFragment"
              }
            ],
            "type": "VirtualFolderNode",
            "abstractKey": null
          },
          "kind": "AliasedInlineFragmentSpread",
          "name": "virtualFolderNodeFrgmt"
        }
      ],
      "type": "VirtualFolderNode",
      "abstractKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};
})();

(node as any).hash = "cf5b9137bde76df9bb38067f541d4b5c";

export default node;
