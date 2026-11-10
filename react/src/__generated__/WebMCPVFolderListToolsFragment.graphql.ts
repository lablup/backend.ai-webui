/**
 * @generated SignedSource<<7b16dbf69d3c0283b24bde46c86da3cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type WebMCPVFolderListToolsFragment$data = ReadonlyArray<{
  readonly accessControl: {
    readonly ownershipType: VFolderOwnershipType;
  };
  readonly entityId: string;
  readonly host: string;
  readonly metadata: {
    readonly cloneable: boolean;
    readonly createdAt: string;
    readonly lastUsed: string | null | undefined;
    readonly name: string;
    readonly usageMode: VFolderUsageMode;
  };
  readonly ownership: {
    readonly project: {
      readonly basicInfo: {
        readonly name: string;
      };
    } | null | undefined;
    readonly user: {
      readonly basicInfo: {
        readonly email: string;
      };
    } | null | undefined;
  };
  readonly usage: {
    readonly numFiles: number;
    readonly usedBytes: {
      readonly expr: string;
    };
  } | null | undefined;
  readonly vfolderStatus: VFolderOperationStatus;
  readonly " $fragmentType": "WebMCPVFolderListToolsFragment";
}>;
export type WebMCPVFolderListToolsFragment$key = ReadonlyArray<{
  readonly " $data"?: WebMCPVFolderListToolsFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"WebMCPVFolderListToolsFragment">;
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
  "name": "WebMCPVFolderListToolsFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
      "storageKey": null
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
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "expr",
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
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};
})();

(node as any).hash = "13dc2202728cbda4bf684786bba2e834";

export default node;
