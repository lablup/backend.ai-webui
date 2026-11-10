/**
 * @generated SignedSource<<94d8e39f57c897f0ff02e321aa5c7e37>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyGroupInput = {
  allowed_vfolder_hosts?: string | null | undefined;
  container_registry?: string | null | undefined;
  description?: string | null | undefined;
  domain_name?: string | null | undefined;
  integration_id?: string | null | undefined;
  is_active?: boolean | null | undefined;
  name?: string | null | undefined;
  resource_policy?: string | null | undefined;
  total_resource_slots?: string | null | undefined;
  user_update_mode?: string | null | undefined;
  user_uuids?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type UpdateAllowedResourceGroupsForProjectInput = {
  add?: ReadonlyArray<string> | null | undefined;
  projectId: string;
  remove?: ReadonlyArray<string> | null | undefined;
};
export type BAIProjectSettingModalModifyMutation$variables = {
  gid: string;
  isResourceGroupsUnchanged: boolean;
  props: ModifyGroupInput;
  resourceGroupsInput: UpdateAllowedResourceGroupsForProjectInput;
};
export type BAIProjectSettingModalModifyMutation$data = {
  readonly adminUpdateAllowedResourceGroupsForProjectV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly modify_group: {
    readonly group: {
      readonly id: string | null | undefined;
      readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
    } | null | undefined;
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectSettingModalModifyMutation = {
  response: BAIProjectSettingModalModifyMutation$data;
  variables: BAIProjectSettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gid"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isResourceGroupsUnchanged"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "props"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupsInput"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "gid",
        "variableName": "gid"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyGroup",
    "kind": "LinkedField",
    "name": "modify_group",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_groups",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "condition": "isResourceGroupsUnchanged",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "input",
            "variableName": "resourceGroupsInput"
          }
        ],
        "concreteType": "AllowedResourceGroupsPayload",
        "kind": "LinkedField",
        "name": "adminUpdateAllowedResourceGroupsForProjectV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "items",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectSettingModalModifyMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIProjectSettingModalModifyMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "dae55c647d5cf0aa257946cc7b09de3f",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectSettingModalModifyMutation(\n  $gid: UUID!\n  $props: ModifyGroupInput!\n  $resourceGroupsInput: UpdateAllowedResourceGroupsForProjectInput!\n  $isResourceGroupsUnchanged: Boolean!\n) {\n  modify_group(gid: $gid, props: $props) {\n    ok\n    msg\n    group {\n      id\n      scaling_groups\n    }\n  }\n  adminUpdateAllowedResourceGroupsForProjectV2(input: $resourceGroupsInput) @skip(if: $isResourceGroupsUnchanged) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "9df89699f8381ef2523d88533788f1ae";

export default node;
