/**
 * @generated SignedSource<<9b5be12bcd0e9f6cb6fcf9a98f5cfa53>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateKeyPairResourcePolicyInput = {
  allowed_vfolder_hosts?: string | null | undefined;
  default_for_unspecified: string;
  idle_timeout: any;
  max_concurrent_sessions: number;
  max_concurrent_sftp_sessions?: number | null | undefined;
  max_containers_per_session: number;
  max_pending_session_count?: number | null | undefined;
  max_pending_session_resource_slots?: string | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_session_lifetime?: number | null | undefined;
  max_vfolder_count?: number | null | undefined;
  max_vfolder_size?: any | null | undefined;
  total_resource_slots?: string | null | undefined;
};
export type KeypairResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateKeyPairResourcePolicyInput;
};
export type KeypairResourcePolicySettingModalCreateMutation$data = {
  readonly create_keypair_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type KeypairResourcePolicySettingModalCreateMutation = {
  response: KeypairResourcePolicySettingModalCreateMutation$data;
  variables: KeypairResourcePolicySettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "CreateKeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "create_keypair_resource_policy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b52e3e869ccfabb393fb45a48074767e",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateKeyPairResourcePolicyInput!\n) {\n  create_keypair_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "7c4c5be505f02fa76e7b4db73a1f4b14";

export default node;
