/**
 * @generated SignedSource<<09b4ac5baf2e211cb9514f8c19b96137>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderAutoMountSettingModalFragment$data = {
  readonly entityId: string;
  readonly mountDestination: string;
  readonly mountPermission: MountPermission;
  readonly subpath: string;
  readonly vfolder: {
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
  readonly vfolderId: string;
  readonly " $fragmentType": "VFolderAutoMountSettingModalFragment";
};
export type VFolderAutoMountSettingModalFragment$key = {
  readonly " $data"?: VFolderAutoMountSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderAutoMountSettingModalFragment",
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
      "kind": "ScalarField",
      "name": "vfolderId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mountDestination",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "subpath",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mountPermission",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolder",
      "kind": "LinkedField",
      "name": "vfolder",
      "plural": false,
      "selections": [
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolderAutoMount",
  "abstractKey": null
};

(node as any).hash = "0ce53f915d6ce562ec12ad9027f273c6";

export default node;
