/**
 * @generated SignedSource<<514d5a97f361d828c0a0a20d504f6506>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChatHeader_Endpoint$data = {
  readonly endpoint_id: string | null | undefined;
  readonly name: string | null | undefined;
  readonly " $fragmentType": "ChatHeader_Endpoint";
};
export type ChatHeader_Endpoint$key = {
  readonly " $data"?: ChatHeader_Endpoint$data;
  readonly " $fragmentSpreads": FragmentRefs<"ChatHeader_Endpoint">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ChatHeader_Endpoint",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endpoint_id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Endpoint",
  "abstractKey": null
};

(node as any).hash = "2ea82665de3ccedca19e1f751f511d03";

export default node;
