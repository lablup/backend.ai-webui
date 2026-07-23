/**
 * @generated SignedSource<<f8a751b07dc63b9e7cdc78afb729a689>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyInfoModalFragment$data = {
  readonly allowed_vfolder_hosts: string | null | undefined;
  readonly created_at: string | null | undefined;
  readonly default_for_unspecified: string | null | undefined;
  readonly idle_timeout: any | null | undefined;
  readonly max_concurrent_sessions: number | null | undefined;
  readonly max_concurrent_sftp_sessions: number | null | undefined;
  readonly max_containers_per_session: number | null | undefined;
  readonly max_pending_session_count: number | null | undefined;
  readonly max_pending_session_resource_slots: string | null | undefined;
  readonly max_session_lifetime: number | null | undefined;
  readonly name: string | null | undefined;
  readonly total_resource_slots: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment">;
  readonly " $fragmentType": "KeypairResourcePolicyInfoModalFragment";
};
export type KeypairResourcePolicyInfoModalFragment$key = {
  readonly " $data"?: KeypairResourcePolicyInfoModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairResourcePolicyInfoModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairResourcePolicyInfoModalFragment",
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
      "name": "created_at",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_pending_session_resource_slots",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment"
    }
  ],
  "type": "KeyPairResourcePolicy",
  "abstractKey": null
};

(node as any).hash = "dd7c66455cb533aefc46d7f6ab093bf2";

export default node;
