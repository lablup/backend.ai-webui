/**
 * @generated SignedSource<<4481fb4cec9952747bdbee174ddf3161>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useVirtualFolderNodePathV2Fragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly metadata: {
    readonly quotaScopeId: string | null | undefined;
  };
  readonly " $fragmentType": "useVirtualFolderNodePathV2Fragment";
};
export type useVirtualFolderNodePathV2Fragment$key = {
  readonly " $data"?: useVirtualFolderNodePathV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useVirtualFolderNodePathV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useVirtualFolderNodePathV2Fragment",
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
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "quotaScopeId",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "4a306d6a09f82bd5a1a8aadc00c32e30";

export default node;
