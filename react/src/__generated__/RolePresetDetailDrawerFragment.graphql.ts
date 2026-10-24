/**
 * @generated SignedSource<<3db6932de36b254f4c7774701cc10e60>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePresetDetailDrawerFragment$data = {
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly deleted: boolean;
  readonly entityId: string;
  readonly id: string;
  readonly name: string;
  readonly scopeType: string;
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"RolePresetPermissionTableFragment">;
  readonly " $fragmentType": "RolePresetDetailDrawerFragment";
};
export type RolePresetDetailDrawerFragment$key = {
  readonly " $data"?: RolePresetDetailDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RolePresetDetailDrawerFragment">;
};

import RolePresetDetailDrawerRefetchQuery_graphql from './RolePresetDetailDrawerRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": RolePresetDetailDrawerRefetchQuery_graphql,
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RolePresetDetailDrawerFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "scopeType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "autoAssign",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "deleted",
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RolePresetPermissionTableFragment"
    }
  ],
  "type": "RolePreset",
  "abstractKey": null
};

(node as any).hash = "5b26127ba85e4f6334868c4239bf5f60";

export default node;
