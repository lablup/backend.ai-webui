/**
 * @generated SignedSource<<c89cfa560ee77c51f869290292774e99>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EndpointStatusTagFragment$data = {
  readonly id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly " $fragmentType": "EndpointStatusTagFragment";
};
export type EndpointStatusTagFragment$key = {
  readonly " $data"?: EndpointStatusTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EndpointStatusTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EndpointStatusTagFragment",
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
    }
  ],
  "type": "Endpoint",
  "abstractKey": null
};

(node as any).hash = "3b31efa50b55edddcb210b59003dc479";

export default node;
