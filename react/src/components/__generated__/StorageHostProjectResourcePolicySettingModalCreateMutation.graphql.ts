/**
 * @generated SignedSource<<d23d25292eeb68bbaced0e9177f1e718>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type CreateProjectResourcePolicyInput = {
  max_vfolder_size: any;
};
export type StorageHostProjectResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateProjectResourcePolicyInput;
};
export type StorageHostProjectResourcePolicySettingModalCreateMutation$data = {
  readonly create_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
    readonly resource_policy: {
      readonly max_vfolder_size: any | null;
    } | null;
  } | null;
};
export type StorageHostProjectResourcePolicySettingModalCreateMutation = {
  response: StorageHostProjectResourcePolicySettingModalCreateMutation$data;
  variables: StorageHostProjectResourcePolicySettingModalCreateMutation$variables;
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
    "concreteType": "CreateProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "create_project_resource_policy",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "resource_policy",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_vfolder_size",
            "storageKey": null
          }
        ],
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
    "name": "StorageHostProjectResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostProjectResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "02391e2741a05db16f165eafe4b87706",
    "id": null,
    "metadata": {},
    "name": "StorageHostProjectResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostProjectResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateProjectResourcePolicyInput!\n) {\n  create_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n    resource_policy {\n      max_vfolder_size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2a9c2da415d456dd1015e0c31e2f1b8b";

export default node;
