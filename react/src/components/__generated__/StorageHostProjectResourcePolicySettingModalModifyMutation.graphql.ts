/**
 * @generated SignedSource<<ec4287eeb5cfd2b2769b345beee85aaf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ModifyProjectResourcePolicyInput = {
  max_vfolder_size: any;
};
export type StorageHostProjectResourcePolicySettingModalModifyMutation$variables = {
  name: string;
  props: ModifyProjectResourcePolicyInput;
};
export type StorageHostProjectResourcePolicySettingModalModifyMutation$data = {
  readonly modify_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type StorageHostProjectResourcePolicySettingModalModifyMutation = {
  response: StorageHostProjectResourcePolicySettingModalModifyMutation$data;
  variables: StorageHostProjectResourcePolicySettingModalModifyMutation$variables;
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
    "concreteType": "ModifyProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "modify_project_resource_policy",
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
    "name": "StorageHostProjectResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostProjectResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c0917a313e0e660123ae05e7194d2fd8",
    "id": null,
    "metadata": {},
    "name": "StorageHostProjectResourcePolicySettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostProjectResourcePolicySettingModalModifyMutation(\n  $name: String!\n  $props: ModifyProjectResourcePolicyInput!\n) {\n  modify_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "98b6e8a892cd55fb170dea71de0bf298";

export default node;
