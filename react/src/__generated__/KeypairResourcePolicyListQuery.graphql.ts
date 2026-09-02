/**
 * @generated SignedSource<<c9536429df51c278c01cc5f4c0f64fdc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairResourcePolicyListQuery$variables = Record<PropertyKey, never>;
export type KeypairResourcePolicyListQuery$data = {
  readonly keypair_resource_policies: ReadonlyArray<{
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly created_at: string | null | undefined;
    readonly default_for_unspecified: string | null | undefined;
    readonly idle_timeout: any | null | undefined;
    readonly max_concurrent_sessions: number | null | undefined;
    readonly max_concurrent_sftp_sessions: number | null | undefined;
    readonly max_containers_per_session: number | null | undefined;
    readonly max_pending_session_count: number | null | undefined;
    readonly max_session_lifetime: number | null | undefined;
    readonly name: string | null | undefined;
    readonly total_resource_slots: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment" | "KeypairResourcePolicyInfoModalFragment" | "KeypairResourcePolicySettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type KeypairResourcePolicyListQuery = {
  response: KeypairResourcePolicyListQuery$data;
  variables: KeypairResourcePolicyListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "default_for_unspecified",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_resource_slots",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_session_lifetime",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_concurrent_sessions",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_containers_per_session",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_timeout",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "allowed_vfolder_hosts",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_pending_session_count",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_concurrent_sftp_sessions",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairResourcePolicy",
        "kind": "LinkedField",
        "name": "keypair_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "KeypairResourcePolicySettingModalFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "KeypairResourcePolicyInfoModalFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "KeypairResourcePolicyListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairResourcePolicy",
        "kind": "LinkedField",
        "name": "keypair_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_pending_session_resource_slots",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8aa6fd2edaf33010f00f1159caae20e3",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyListQuery",
    "operationKind": "query",
    "text": "query KeypairResourcePolicyListQuery {\n  keypair_resource_policies {\n    name\n    default_for_unspecified\n    total_resource_slots\n    max_session_lifetime\n    max_concurrent_sessions\n    max_containers_per_session\n    idle_timeout\n    allowed_vfolder_hosts\n    max_pending_session_count @since(version: \"24.03.4\")\n    max_concurrent_sftp_sessions @since(version: \"24.03.4\")\n    created_at\n    ...KeypairResourcePolicySettingModalFragment\n    ...KeypairResourcePolicyInfoModalFragment\n    ...BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment\n  }\n}\n\nfragment BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment on KeyPairResourcePolicy {\n  allowed_vfolder_hosts\n}\n\nfragment KeypairResourcePolicyInfoModalFragment on KeyPairResourcePolicy {\n  name\n  created_at\n  default_for_unspecified\n  total_resource_slots\n  max_session_lifetime\n  max_concurrent_sessions\n  max_containers_per_session\n  idle_timeout\n  allowed_vfolder_hosts\n  max_pending_session_count @since(version: \"24.03.4\")\n  max_concurrent_sftp_sessions @since(version: \"24.03.4\")\n  max_pending_session_resource_slots @since(version: \"24.03.4\")\n  ...BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment\n}\n\nfragment KeypairResourcePolicySettingModalFragment on KeyPairResourcePolicy {\n  name\n  default_for_unspecified\n  total_resource_slots\n  max_session_lifetime\n  max_concurrent_sessions\n  max_containers_per_session\n  idle_timeout\n  allowed_vfolder_hosts\n  max_pending_session_count @since(version: \"24.03.4\")\n  max_concurrent_sftp_sessions @since(version: \"24.03.4\")\n}\n"
  }
};
})();

(node as any).hash = "82203a46b35856249641eb2e7cc9f9c0";

export default node;
