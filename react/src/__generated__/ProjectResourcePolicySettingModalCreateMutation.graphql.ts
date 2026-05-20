/**
 * @generated SignedSource<<018c67762a92cca5da9105d24c8ee706>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateProjectResourcePolicyInput = {
  max_network_count?: number | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_vfolder_count?: number | null | undefined;
  max_vfolder_size?: any | null | undefined;
};
export type ProjectResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateProjectResourcePolicyInput;
};
export type ProjectResourcePolicySettingModalCreateMutation$data = {
  readonly create_project_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
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
    "type": "Mutation",
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
    "cacheID": "b94d7a4b8e8341df4e396784abba4203",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateProjectResourcePolicyInput!\n) {\n  create_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "c0683608e8a527146563ba5bd9fcad33";

export default node;
