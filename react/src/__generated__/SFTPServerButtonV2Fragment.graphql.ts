/**
 * @generated SignedSource<<9eedf5511ed28d46c59435f3e1c79424>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SFTPServerButtonV2Fragment$data = {
  readonly entityId: string;
  readonly host: string;
  readonly id: string;
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "SFTPServerButtonV2Fragment";
};
export type SFTPServerButtonV2Fragment$key = {
  readonly " $data"?: SFTPServerButtonV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SFTPServerButtonV2Fragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SFTPServerButtonV2Fragment",
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
      "kind": "ScalarField",
      "name": "host",
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
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "711e9e4a192cd5b7ec89ea2a45e7f18a";

export default node;
