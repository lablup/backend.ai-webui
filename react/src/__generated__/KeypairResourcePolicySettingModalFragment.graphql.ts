/**
 * @generated SignedSource<<dce1256a41b3c7bd05233e06101ddd20>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicySettingModalFragment$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly default_for_unspecified: string | null | undefined;
  readonly idle_timeout: any | null | undefined;
  readonly max_concurrent_sessions: number | null | undefined;
  readonly max_concurrent_sftp_sessions: number | null | undefined;
  readonly max_containers_per_session: number | null | undefined;
  readonly max_pending_session_count: number | null | undefined;
  readonly max_session_lifetime: number | null | undefined;
  readonly name: string | null | undefined;
  readonly total_resource_slots: string | null | undefined;
  readonly " $fragmentType": "KeypairResourcePolicySettingModalFragment";
};
export type KeypairResourcePolicySettingModalFragment$key = {
  readonly " $data"?: KeypairResourcePolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairResourcePolicySettingModalFragment",
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
      "name": "default_for_unspecified",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "total_resource_slots",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_session_lifetime",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_concurrent_sessions",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_containers_per_session",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "idle_timeout",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_vfolder_hosts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_pending_session_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_concurrent_sftp_sessions",
      "storageKey": null
    }
  ],
  "type": "KeyPairResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "7200f02275c0bbd9c1a2b4c8c215dae5";

export default node;
