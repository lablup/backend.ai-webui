/**
 * @generated SignedSource<<23d9b7d4d36e053f8db5a7c32a78b438>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionAccessKeyFragment$data = {
  readonly access_key: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly " $fragmentType": "SessionAccessKeyFragment";
};
export type SessionAccessKeyFragment$key = {
  readonly " $data"?: SessionAccessKeyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionAccessKeyFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionAccessKeyFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "access_key",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_id",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "de112170b9141084b2ad5bda41344d3f";

export default node;
