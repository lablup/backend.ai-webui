/**
 * @generated SignedSource<<ac8dee02b0468df1a5d7c431554660b5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIKeypairResourcePolicyV2TableFragment$data = ReadonlyArray<{
  readonly allowedVfolderHosts: ReadonlyArray<{
    readonly host: string;
    readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
  }>;
  readonly createdAt: string | null | undefined;
  readonly defaultForUnspecified: string;
  readonly id: string;
  readonly idleTimeout: number;
  readonly maxConcurrentSessions: number;
  readonly maxConcurrentSftpSessions: number;
  readonly maxContainersPerSession: number;
  readonly maxPendingSessionCount: number | null | undefined;
  readonly maxPendingSessionResourceSlots: ReadonlyArray<{
    readonly quantity: any | null | undefined;
    readonly resourceType: string;
    readonly unlimited: boolean;
  }> | null | undefined;
  readonly maxSessionLifetime: number;
  readonly name: string;
  readonly totalResourceSlots: ReadonlyArray<{
    readonly quantity: any | null | undefined;
    readonly resourceType: string;
    readonly unlimited: boolean;
  }>;
  readonly " $fragmentType": "BAIKeypairResourcePolicyV2TableFragment";
}>;
export type BAIKeypairResourcePolicyV2TableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIKeypairResourcePolicyV2TableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIKeypairResourcePolicyV2TableFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "resourceType",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "quantity",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "unlimited",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIKeypairResourcePolicyV2TableFragment",
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
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "defaultForUnspecified",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceLimitEntry",
      "kind": "LinkedField",
      "name": "totalResourceSlots",
      "plural": true,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxSessionLifetime",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxConcurrentSessions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxPendingSessionCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceLimitEntry",
      "kind": "LinkedField",
      "name": "maxPendingSessionResourceSlots",
      "plural": true,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxConcurrentSftpSessions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxContainersPerSession",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "idleTimeout",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderHostPermissionEntry",
      "kind": "LinkedField",
      "name": "allowedVfolderHosts",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "host",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permissions",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "KeypairResourcePolicyV2",
  "abstractKey": null
};
})();

(node as any).hash = "1a19df2e16d3bde603641cb63be4eec7";

export default node;
