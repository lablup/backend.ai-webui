/**
 * @generated SignedSource<<d21430b94b671f8fe916f823f76c7b4a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairInfoModalFragment$data = {
  readonly access_key: string | null | undefined;
  readonly concurrency_used: number | null | undefined;
  readonly created_at: string | null | undefined;
  readonly is_admin: boolean | null | undefined;
  readonly last_used: string | null | undefined;
  readonly num_queries: number | null | undefined;
  readonly rate_limit: number | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly secret_key: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly " $fragmentType": "KeypairInfoModalFragment";
};
export type KeypairInfoModalFragment$key = {
  readonly " $data"?: KeypairInfoModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairInfoModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairInfoModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_id",
      "storageKey": null
    },
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
      "name": "secret_key",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_admin",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "last_used",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "num_queries",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "rate_limit",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "concurrency_used",
      "storageKey": null
    }
  ],
  "type": "KeyPair",
  "abstractKey": null
};

(node as any).hash = "11d6baebc6283f59151dab410a2a80d2";

export default node;
