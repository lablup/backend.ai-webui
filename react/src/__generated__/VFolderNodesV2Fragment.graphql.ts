/**
 * @generated SignedSource<<150054d5b341119d8e71f4ce4865a9f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
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
  readonly permissions: ReadonlyArray<PermissionBit>;
  readonly quota: {
    readonly maxFiles: number;
    readonly maxSize: {
      readonly expr: string;
    } | null | undefined;
  };
  readonly unmanagedPath: string | null | undefined;
  readonly usage?: {
    readonly numFiles: number;
    readonly usedBytes: {
      readonly expr: string;
    };
  } | null | undefined;
  readonly vfolderStatus: VFolderOperationStatus;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteForeverVFolderModalV2Fragment" | "SharedFolderPermissionInfoModalV2Fragment" | "VFolderNodeIdenticonV2Fragment" | "VFolderPermissionCellV2Fragment">;
  readonly " $fragmentType": "VFolderNodesV2Fragment";
} | null | undefined>;
export type VFolderNodesV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: VFolderNodesV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2Fragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "expr",
    "storageKey": null
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "showUsage"
    }
  ],
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
      "condition": "showUsage",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "VFolderUsageInfo",
          "kind": "LinkedField",
          "name": "usage",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "numFiles",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "BinarySizeInfo",
              "kind": "LinkedField",
              "name": "usedBytes",
              "plural": false,
              "selections": (v0/*: any*/),
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        (v1/*: any*/),
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
      "kind": "ScalarField",
      "name": "permissions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderQuotaInfo",
      "kind": "LinkedField",
      "name": "quota",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "maxFiles",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "BinarySizeInfo",
          "kind": "LinkedField",
          "name": "maxSize",
          "plural": false,
          "selections": (v0/*: any*/),
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
                (v1/*: any*/)
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

(node as any).hash = "bf6b78832456b38f0977eb208bdadc79";

export default node;
