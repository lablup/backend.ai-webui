/**
 * @generated SignedSource<<6a903b67e6bffd0887cee585fadf94e3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderAutoMountMetadataSectionFragment$data = {
  readonly accessControl: {
    readonly ownershipType: VFolderOwnershipType;
  };
  readonly entityId: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly ownership: {
    readonly creatorId: string | null | undefined;
    readonly project: {
      readonly basicInfo: {
        readonly type: ProjectTypeV2;
      };
    } | null | undefined;
    readonly projectId: string | null | undefined;
    readonly userId: string | null | undefined;
  };
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2AutoMountCellFragment">;
  readonly " $fragmentType": "VFolderAutoMountMetadataSectionFragment";
};
export type VFolderAutoMountMetadataSectionFragment$key = {
  readonly " $data"?: VFolderAutoMountMetadataSectionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountMetadataSectionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderAutoMountMetadataSectionFragment",
  "selections": [
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
          "name": "userId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "creatorId",
          "storageKey": null
        },
        {
          "kind": "CatchField",
          "field": {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "project",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectBasicInfo",
                "kind": "LinkedField",
                "name": "basicInfo",
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
            "storageKey": null
          },
          "to": "NULL"
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodesV2AutoMountCellFragment"
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "0457fd4fa4d1c1f34d0d54d6243efe98";

export default node;
