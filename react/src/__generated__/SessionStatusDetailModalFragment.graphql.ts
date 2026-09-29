/**
 * @generated SignedSource<<8527adc94158384b72a14cb77d58a0c7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionStatusDetailModalFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly starts_at: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_data: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"SessionStatusBadgeFragment">;
  readonly " $fragmentType": "SessionStatusDetailModalFragment";
};
export type SessionStatusDetailModalFragment$key = {
  readonly " $data"?: SessionStatusDetailModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionStatusDetailModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionStatusDetailModalFragment",
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
      "name": "name",
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
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_data",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "starts_at",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionStatusBadgeFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "fc37c9c14fb1727ab998612da8eb5eff";

export default node;
