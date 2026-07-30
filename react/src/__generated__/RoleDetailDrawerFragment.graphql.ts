/**
 * @generated SignedSource<<c3cd34e2b6d07b9ed7a1c6dccab019b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerFragment$data = {
  readonly id: string;
  readonly name: string;
  readonly source: RoleSource;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentFragment" | "RoleFormModalFragment">;
  readonly " $fragmentType": "RoleDetailDrawerFragment";
};
export type RoleDetailDrawerFragment$key = {
  readonly " $data"?: RoleDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerFragment">;
};

import RoleDetailDrawerRefetchQuery_graphql from './RoleDetailDrawerRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": RoleDetailDrawerRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RoleDetailDrawerFragment",
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
      "name": "name",
      "storageKey": null
    },
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
      "name": "RoleDetailDrawerContentFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleFormModalFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "6227cfcf225e6263476a28cbd1b58f73";

export default node;
