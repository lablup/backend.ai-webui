/**
 * @generated SignedSource<<c3b4377344123a47918ffc7a644565f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EndpointOwnerInfoFragment$data = {
  readonly created_user_email: string | null | undefined;
  readonly id: string | null | undefined;
  readonly session_owner_email: string | null | undefined;
  readonly " $fragmentType": "EndpointOwnerInfoFragment";
};
export type EndpointOwnerInfoFragment$key = {
  readonly " $data"?: EndpointOwnerInfoFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EndpointOwnerInfoFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EndpointOwnerInfoFragment",
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
      "name": "created_user_email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "session_owner_email",
      "storageKey": null
    }
  ],
  "type": "Endpoint",
  "abstractKey": null
};

(node as any).hash = "fb21a441c8873205b5092ae1a5a7157e";

export default node;
