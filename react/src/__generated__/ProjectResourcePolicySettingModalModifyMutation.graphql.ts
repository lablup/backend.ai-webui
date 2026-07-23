/**
 * @generated SignedSource<<a308fcdd6cd4f30f2db50e6e555d5885>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyProjectResourcePolicyInput = {
  max_network_count?: number | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_vfolder_count?: number | null | undefined;
  max_vfolder_size?: any | null | undefined;
};
export type ProjectResourcePolicySettingModalModifyMutation$variables = {
  name: string;
  props: ModifyProjectResourcePolicyInput;
};
export type ProjectResourcePolicySettingModalModifyMutation$data = {
  readonly modify_project_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ProjectResourcePolicySettingModalModifyMutation = {
  response: ProjectResourcePolicySettingModalModifyMutation$data;
  variables: ProjectResourcePolicySettingModalModifyMutation$variables;
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
    "name": "ProjectResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "aedc4eab77206f7ab189ccd3f2d938b3",
    "id": null,
    "metadata": {},
    "name": "ProjectResourcePolicySettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectResourcePolicySettingModalModifyMutation(\n  $name: String!\n  $props: ModifyProjectResourcePolicyInput!\n) {\n  modify_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "3cd62195489eba58dd9693f1fc9df8ff";

export default node;
