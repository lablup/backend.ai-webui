/**
 * @generated SignedSource<<0dc6c95f6ec12f42614f89c27501ddae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyV2SettingModalFragment$data = {
  readonly allowedVfolderHosts: ReadonlyArray<{
    readonly host: string;
    readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
  }>;
  readonly defaultForUnspecified: string;
  readonly id: string;
  readonly idleTimeout: number;
  readonly maxConcurrentSessions: number;
  readonly maxConcurrentSftpSessions: number;
  readonly maxContainersPerSession: number;
  readonly maxPendingSessionCount: number | null | undefined;
  readonly maxSessionLifetime: number;
  readonly name: string;
  readonly totalResourceSlots: ReadonlyArray<{
    readonly quantity: any | null | undefined;
    readonly resourceType: string;
    readonly unlimited: boolean;
  }>;
  readonly " $fragmentType": "KeypairResourcePolicyV2SettingModalFragment";
};
export type KeypairResourcePolicyV2SettingModalFragment$key = {
  readonly " $data"?: KeypairResourcePolicyV2SettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyV2SettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairResourcePolicyV2SettingModalFragment",
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
      "selections": [
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
      ],
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
      "kind": "ScalarField",
      "name": "maxPendingSessionCount",
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

(node as any).hash = "689ae08c63690331faf350dfffd98b2c";

export default node;
