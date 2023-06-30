/**
 * @generated SignedSource<<0514d83940f7190fd8749f47d6034c40>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type StorageHostSettingsPanelDeleteProjectResourcePolicyMutation$variables = {
  name: string;
};
export type StorageHostSettingsPanelDeleteProjectResourcePolicyMutation$data = {
  readonly delete_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type StorageHostSettingsPanelDeleteProjectResourcePolicyMutation = {
  response: StorageHostSettingsPanelDeleteProjectResourcePolicyMutation$data;
  variables: StorageHostSettingsPanelDeleteProjectResourcePolicyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
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
      }
    ],
    "concreteType": "DeleteProjectResourcePolicy",
    "kind": "LinkedField",
    "name": "delete_project_resource_policy",
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
    "name": "StorageHostSettingsPanelDeleteProjectResourcePolicyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageHostSettingsPanelDeleteProjectResourcePolicyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "58bb519443a80ed39deef7894170ae28",
    "id": null,
    "metadata": {},
    "name": "StorageHostSettingsPanelDeleteProjectResourcePolicyMutation",
    "operationKind": "mutation",
    "text": "mutation StorageHostSettingsPanelDeleteProjectResourcePolicyMutation(\n  $name: String!\n) {\n  delete_project_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "8da224365e6c5abf11536c28a0423248";

export default node;
