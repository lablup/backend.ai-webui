/**
 * @generated SignedSource<<90a08136e2f6f03bc56b86c6d6aa367f>>
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
export type ProjectResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateProjectResourcePolicyInput;
};
export type ProjectResourcePolicySettingModalCreateMutation$data = {
  readonly create_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
    readonly resource_policy: {
      readonly max_vfolder_size: any | null;
    } | null;
  } | null;
};
export type ProjectResourcePolicySettingModalCreateMutation = {
  response: ProjectResourcePolicySettingModalCreateMutation$data;
  variables: ProjectResourcePolicySettingModalCreateMutation$variables;
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
    "name": "ProjectResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3a411e9a4782713efe26879d8c4c81dd",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateProjectResourcePolicyInput!\n) {\n  create_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n    resource_policy {\n      max_vfolder_size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4aeb3a2a387d9722c44a8bde5e6c7cf";

export default node;
