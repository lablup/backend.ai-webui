/**
 * @generated SignedSource<<93f2a1d9f8064751d9e442b1df7ebdda>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerV2Fragment$data = {
  readonly id: string;
  readonly source: RoleSource;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentV2Fragment" | "RoleFormModalFragment">;
  readonly " $fragmentType": "RoleDetailDrawerV2Fragment";
};
export type RoleDetailDrawerV2Fragment$key = {
  readonly " $data"?: RoleDetailDrawerV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerV2Fragment">;
};

import RoleDetailDrawerV2RefetchQuery_graphql from './RoleDetailDrawerV2RefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": RoleDetailDrawerV2RefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RoleDetailDrawerV2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "source",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleDetailDrawerContentV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleFormModalFragment"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "b9a311b9ce7e1a05459123018d943717";

export default node;
