/**
 * @generated SignedSource<<488adb81f4647cb80fbcfab53d1b7637>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EndpointListFragment$data = ReadonlyArray<{
  readonly created_at: string;
  readonly created_user_email: string | null | undefined;
  readonly desired_session_count: number | null | undefined;
  readonly endpoint_id: string | null | undefined;
  readonly lifecycle_stage: string | null | undefined;
  readonly name: string | null | undefined;
  readonly open_to_public: boolean | null | undefined;
  readonly project: string | null | undefined;
  readonly replicas: number | null | undefined;
  readonly runtime_variant: {
    readonly human_readable_name: string | null | undefined;
  } | null | undefined;
  readonly status: string | null | undefined;
  readonly url: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"EndpointOwnerInfoFragment" | "EndpointStatusTagFragment">;
  readonly " $fragmentType": "EndpointListFragment";
}>;
export type EndpointListFragment$key = ReadonlyArray<{
  readonly " $data"?: EndpointListFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EndpointListFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "EndpointListFragment",
  "selections": [
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
      "name": "endpoint_id",
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
      "name": "lifecycle_stage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "open_to_public",
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
      "name": "replicas",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "desired_session_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "project",
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
      "concreteType": "RuntimeVariantInfo",
      "kind": "LinkedField",
      "name": "runtime_variant",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "human_readable_name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EndpointOwnerInfoFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EndpointStatusTagFragment"
    }
  ],
  "type": "Endpoint",
  "abstractKey": null
};

(node as any).hash = "e5e7c4434db7ff9aca12599687475ef1";

export default node;
