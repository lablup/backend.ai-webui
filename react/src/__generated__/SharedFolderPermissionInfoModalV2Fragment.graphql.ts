/**
 * @generated SignedSource<<2b3f69529c00ccc95b826a54e3293702>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type SharedFolderPermissionInfoModalV2Fragment$data = {
  readonly accessControl: {
    readonly ownershipType: VFolderOwnershipType;
  };
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly ownership: {
    readonly creatorEmail: string | null | undefined;
    readonly user: {
      readonly basicInfo: {
        readonly email: string;
      };
    } | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"VFolderPermissionCellV2Fragment">;
  readonly " $fragmentType": "SharedFolderPermissionInfoModalV2Fragment";
};
export type SharedFolderPermissionInfoModalV2Fragment$key = {
  readonly " $data"?: SharedFolderPermissionInfoModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SharedFolderPermissionInfoModalV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SharedFolderPermissionInfoModalV2Fragment",
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
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderAccessControlInfo",
      "kind": "LinkedField",
      "name": "accessControl",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ownershipType",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderOwnershipInfo",
      "kind": "LinkedField",
      "name": "ownership",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "creatorEmail",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2",
          "kind": "LinkedField",
          "name": "user",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "UserV2BasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "email",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderPermissionCellV2Fragment"
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "5a18839a6dffea1a5a545710cc7e8bda";

export default node;
