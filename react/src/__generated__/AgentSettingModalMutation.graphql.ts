/**
 * @generated SignedSource<<b98a20d912bb8bece6193f100224dd3d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyAgentInput = {
  scaling_group?: string | null | undefined;
  schedulable?: boolean | null | undefined;
};
export type AgentSettingModalMutation$variables = {
  id: string;
  props: ModifyAgentInput;
};
export type AgentSettingModalMutation$data = {
  readonly modify_agent: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type AgentSettingModalMutation = {
  response: AgentSettingModalMutation$data;
  variables: AgentSettingModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyAgent",
    "kind": "LinkedField",
    "name": "modify_agent",
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
    "name": "AgentSettingModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgentSettingModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1a9e43d4bc6e78f3949d1a2a397ff00e",
    "id": null,
    "metadata": {},
    "name": "AgentSettingModalMutation",
    "operationKind": "mutation",
    "text": "mutation AgentSettingModalMutation(\n  $id: String!\n  $props: ModifyAgentInput!\n) {\n  modify_agent(id: $id, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "13b2a6a91c7f08bbced5fde155ded60e";

export default node;
