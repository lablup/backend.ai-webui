/**
 * @generated SignedSource<<2c7bff175b4670c33e7362084dbd3aa0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type EntityShareNodesFragment$data = ReadonlyArray<{
  readonly createdAt: string;
  readonly entityId: string;
  readonly expiresAt: string | null | undefined;
  readonly id: string;
  readonly permissions: ReadonlyArray<PermissionBit>;
  readonly recipientEmail: string | null | undefined;
  readonly recipientEntityId: string | null | undefined;
  readonly recipientEntityType: string | null | undefined;
  readonly sharerUserId: string | null | undefined;
  readonly status: EntityShareStatus;
  readonly targetEntityId: string;
  readonly targetEntityType: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "EntityShareNodesFragment";
}>;
export type EntityShareNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: EntityShareNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EntityShareNodesFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "EntityShareNodesFragment",
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
      "name": "sharerUserId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "recipientEntityType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "recipientEntityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "recipientEmail",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "targetEntityType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "targetEntityId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permissions",
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
      "name": "expiresAt",
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
  "type": "EntityShare",
  "abstractKey": null
};

(node as any).hash = "e819eea1edbca6008243ad4b5a823eb2";

export default node;
