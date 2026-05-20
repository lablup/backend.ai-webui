/**
 * @generated SignedSource<<a049fb3de3727c84a849d4dd9002ef87>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LegacyModelTryContentButtonVFolderFragment$data = {
  readonly host: string | null | undefined;
  readonly id: string;
  readonly name: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly " $fragmentType": "LegacyModelTryContentButtonVFolderFragment";
};
export type LegacyModelTryContentButtonVFolderFragment$key = {
  readonly " $data"?: LegacyModelTryContentButtonVFolderFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"LegacyModelTryContentButtonVFolderFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LegacyModelTryContentButtonVFolderFragment",
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
      "name": "row_id",
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
      "name": "host",
      "storageKey": null
    }
  ],
  "type": "VirtualFolderNode",
  "abstractKey": null
};

(node as any).hash = "af45540cbcab868291574ce59d9b585e";

export default node;
