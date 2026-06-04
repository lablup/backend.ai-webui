/**
 * @generated SignedSource<<b2e30a117003fc18186cbbcb484c6a38>>
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
export type KeypairResourcePolicyStoragePermissionTableModifyMutation$variables = {
  name: string;
  props: ModifyKeyPairResourcePolicyInput;
};
export type KeypairResourcePolicyStoragePermissionTableModifyMutation$data = {
  readonly modify_keypair_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type KeypairResourcePolicyStoragePermissionTableModifyMutation = {
  response: KeypairResourcePolicyStoragePermissionTableModifyMutation$data;
  variables: KeypairResourcePolicyStoragePermissionTableModifyMutation$variables;
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
    "name": "KeypairResourcePolicyStoragePermissionTableModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "331d87f5d6fee2424bbf944d6ab34cd1",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableModifyMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyStoragePermissionTableModifyMutation(\n  $name: String!\n  $props: ModifyKeyPairResourcePolicyInput!\n) {\n  modify_keypair_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "402faf9a9575e99b8074b52dccd8b375";

export default node;
