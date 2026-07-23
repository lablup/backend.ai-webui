/**
 * @generated SignedSource<<f3b4c2d4d3ddfa5e960b8684cbe99779>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type EditableVFolderNameV2Fragment$data = {
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly ownership: {
    readonly projectId: string | null | undefined;
    readonly userId: string | null | undefined;
  };
  readonly status: VFolderOperationStatus;
  readonly " $fragmentType": "EditableVFolderNameV2Fragment";
};
export type EditableVFolderNameV2Fragment$key = {
  readonly " $data"?: EditableVFolderNameV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditableVFolderNameV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditableVFolderNameV2Fragment",
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
      "name": "status",
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "b023311316ae114a381046a90112164c";

export default node;
