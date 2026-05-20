/**
 * @generated SignedSource<<18f662171cdf11c0e5d20006f23168d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderMountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderNodesV2Fragment$data = ReadonlyArray<{
  readonly accessControl: {
    readonly ownershipType: VFolderOwnershipType;
    readonly permission: VFolderMountPermission;
  };
  readonly host: string;
  readonly id: string;
  readonly metadata: {
    readonly cloneable: boolean;
    readonly createdAt: string;
    readonly lastUsed: string | null | undefined;
    readonly name: string;
    readonly quotaScopeId: string | null | undefined;
    readonly usageMode: VFolderUsageMode;
  };
  readonly notificationFrgmt: {
    readonly " $fragmentSpreads": FragmentRefs<"BAINodeNotificationItemFragment">;
  };
  readonly ownership: {
    readonly creatorEmail: string | null | undefined;
    readonly project: {
      readonly basicInfo: {
        readonly name: string;
      };
    } | null | undefined;
    readonly projectId: string | null | undefined;
    readonly user: {
      readonly basicInfo: {
        readonly email: string;
      };
    } | null | undefined;
    readonly userId: string | null | undefined;
  };
  readonly unmanagedPath: string | null | undefined;
  readonly vfolderStatus: VFolderOperationStatus;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteForeverVFolderModalV2Fragment" | "SharedFolderPermissionInfoModalV2Fragment" | "VFolderNodeIdenticonV2Fragment" | "VFolderPermissionCellV2Fragment">;
  readonly " $fragmentType": "VFolderNodesV2Fragment";
} | null | undefined>;
export type VFolderNodesV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: VFolderNodesV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2Fragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "VFolderNodesV2Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
    },
    {
      "alias": "vfolderStatus",
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    },
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
      "name": "unmanagedPath",
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
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "usageMode",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "quotaScopeId",
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
          "name": "lastUsed",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "cloneable",
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
          "name": "permission",
          "storageKey": null
        },
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
        },
        {
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
                (v0/*: any*/)
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
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "VFolderNodeIdenticonV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SharedFolderPermissionInfoModalV2Fragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeleteForeverVFolderModalV2Fragment"
    },
    {
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAINodeNotificationItemFragment"
          }
        ],
        "type": "Node",
        "abstractKey": "__isNode"
      },
      "kind": "AliasedInlineFragmentSpread",
      "name": "notificationFrgmt"
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};
})();

(node as any).hash = "07611fcd2a8e6b5fb66ca14bf652e541";

export default node;
