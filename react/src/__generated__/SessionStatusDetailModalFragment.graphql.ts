/**
 * @generated SignedSource<<0bf5a55120b301bd5d7b00e5220da45d>>
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
  readonly " $fragmentSpreads": FragmentRefs<"SessionStatusTagFragment">;
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
      "name": "SessionStatusTagFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "9fda416861ce96da9edb0c823baaa6b8";

export default node;
