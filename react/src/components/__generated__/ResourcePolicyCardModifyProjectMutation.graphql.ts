/**
 * @generated SignedSource<<b263bb8feadf06719a2f9fba3160a16b>>
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
export type ResourcePolicyCardModifyProjectMutation$variables = {
  name: string;
  props: ModifyProjectResourcePolicyInput;
};
export type ResourcePolicyCardModifyProjectMutation$data = {
  readonly modify_project_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type ResourcePolicyCardModifyProjectMutation = {
  response: ResourcePolicyCardModifyProjectMutation$data;
  variables: ResourcePolicyCardModifyProjectMutation$variables;
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
    "name": "ResourcePolicyCardModifyProjectMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePolicyCardModifyProjectMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "187f01c6b4def3afeb9b1890160738ff",
    "id": null,
    "metadata": {},
    "name": "ResourcePolicyCardModifyProjectMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePolicyCardModifyProjectMutation(\n  $name: String!\n  $props: ModifyProjectResourcePolicyInput!\n) {\n  modify_project_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "0aa47dc55b37b27a5c880470a2e98ceb";

export default node;
