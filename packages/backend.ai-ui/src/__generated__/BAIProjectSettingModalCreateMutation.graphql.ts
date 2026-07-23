/**
 * @generated SignedSource<<bd8725485dbe3a4907ad2a48757ccd11>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupInput = {
  allowed_vfolder_hosts?: string | null | undefined;
  container_registry?: string | null | undefined;
  description?: string | null | undefined;
  domain_name: string;
  integration_id?: string | null | undefined;
  is_active?: boolean | null | undefined;
  resource_policy?: string | null | undefined;
  total_resource_slots?: string | null | undefined;
  type?: string | null | undefined;
};
export type BAIProjectSettingModalCreateMutation$variables = {
  name: string;
  props: GroupInput;
};
export type BAIProjectSettingModalCreateMutation$data = {
  readonly create_group: {
    readonly group: {
      readonly id: string | null | undefined;
    } | null | undefined;
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectSettingModalCreateMutation = {
  response: BAIProjectSettingModalCreateMutation$data;
  variables: BAIProjectSettingModalCreateMutation$variables;
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
    "concreteType": "CreateGroup",
    "kind": "LinkedField",
    "name": "create_group",
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
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "group",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "name": "BAIProjectSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ac930a347b7e91f41c3e930775edceb6",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectSettingModalCreateMutation(\n  $name: String!\n  $props: GroupInput!\n) {\n  create_group(name: $name, props: $props) {\n    ok\n    msg\n    group {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e623ab300f600f8772d62eb07cf90da2";

export default node;
