/**
 * @generated SignedSource<<d208d86b2b5d7cd24bc901336bcfa2a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyKeyPairResourcePolicyInput = {
  allowed_vfolder_hosts?: string | null | undefined;
  default_for_unspecified?: string | null | undefined;
  idle_timeout?: any | null | undefined;
  max_concurrent_sessions?: number | null | undefined;
  max_concurrent_sftp_sessions?: number | null | undefined;
  max_containers_per_session?: number | null | undefined;
  max_pending_session_count?: number | null | undefined;
  max_pending_session_resource_slots?: string | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_session_lifetime?: number | null | undefined;
  max_vfolder_count?: number | null | undefined;
  max_vfolder_size?: any | null | undefined;
  total_resource_slots?: string | null | undefined;
};
export type KeypairResourcePolicySettingModalModifyMutation$variables = {
  name: string;
  props: ModifyKeyPairResourcePolicyInput;
};
export type KeypairResourcePolicySettingModalModifyMutation$data = {
  readonly modify_keypair_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type KeypairResourcePolicySettingModalModifyMutation = {
  response: KeypairResourcePolicySettingModalModifyMutation$data;
  variables: KeypairResourcePolicySettingModalModifyMutation$variables;
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
    "concreteType": "ModifyKeyPairResourcePolicy",
    "kind": "LinkedField",
    "name": "modify_keypair_resource_policy",
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
    "name": "KeypairResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "72be648e07857dd6923d7c81f3f19948",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicySettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicySettingModalModifyMutation(\n  $name: String!\n  $props: ModifyKeyPairResourcePolicyInput!\n) {\n  modify_keypair_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "8c99c8be8781f93fed817a67c86ea966";

export default node;
