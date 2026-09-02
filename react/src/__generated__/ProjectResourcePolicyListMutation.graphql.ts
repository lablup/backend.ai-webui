/**
 * @generated SignedSource<<653c29fa1207a836c0f67a752b92919d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourcePolicyListMutation$variables = {
  name: string;
};
export type ProjectResourcePolicyListMutation$data = {
  readonly delete_project_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ProjectResourcePolicyListMutation = {
  response: ProjectResourcePolicyListMutation$data;
  variables: ProjectResourcePolicyListMutation$variables;
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
    "name": "ProjectResourcePolicyListMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicyListMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9f1218faa2207eff18f5a145f12f87ac",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicyListMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicyListMutation(\n  $name: String!\n) {\n  delete_project_resource_policy(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c5a20c6c463174bbfc726a27cdfdcac";

export default node;
