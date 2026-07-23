/**
 * @generated SignedSource<<e38d3caab2efc4326308f3334aa73509>>
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
export type BAIProjectSettingModalModifyMutation$variables = {
  gid: string;
  isFetchedResourceGroupsEmpty: boolean;
  isResourceGroupsEmpty: boolean;
  props: ModifyGroupInput;
  scaling_groups: ReadonlyArray<string | null | undefined>;
};
export type BAIProjectSettingModalModifyMutation$data = {
  readonly associate_scaling_groups_with_user_group?: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
  readonly disassociate_all_scaling_groups_with_group?: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
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
  "name": "isFetchedResourceGroupsEmpty"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isResourceGroupsEmpty"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "props"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scaling_groups"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msg",
  "storageKey": null
},
v7 = {
  "kind": "Variable",
  "name": "user_group",
  "variableName": "gid"
},
v8 = [
  (v5/*: any*/),
  (v6/*: any*/)
],
v9 = [
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
      (v5/*: any*/),
      (v6/*: any*/),
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
    "condition": "isFetchedResourceGroupsEmpty",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v7/*: any*/)
        ],
        "concreteType": "DisassociateAllScalingGroupsWithGroup",
        "kind": "LinkedField",
        "name": "disassociate_all_scaling_groups_with_group",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "isResourceGroupsEmpty",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "scaling_groups",
            "variableName": "scaling_groups"
          },
          (v7/*: any*/)
        ],
        "concreteType": "AssociateScalingGroupsWithUserGroup",
        "kind": "LinkedField",
        "name": "associate_scaling_groups_with_user_group",
        "plural": false,
        "selections": (v8/*: any*/),
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
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIProjectSettingModalModifyMutation",
    "selections": (v9/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIProjectSettingModalModifyMutation",
    "selections": (v9/*: any*/)
  },
  "params": {
    "cacheID": "1f95a54db43d3bb454df1f3dfd4309db",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectSettingModalModifyMutation(\n  $gid: UUID!\n  $props: ModifyGroupInput!\n  $scaling_groups: [String]!\n  $isFetchedResourceGroupsEmpty: Boolean!\n  $isResourceGroupsEmpty: Boolean!\n) {\n  modify_group(gid: $gid, props: $props) {\n    ok\n    msg\n    group {\n      id\n      scaling_groups\n    }\n  }\n  disassociate_all_scaling_groups_with_group(user_group: $gid) @skip(if: $isFetchedResourceGroupsEmpty) {\n    ok\n    msg\n  }\n  associate_scaling_groups_with_user_group(scaling_groups: $scaling_groups, user_group: $gid) @skip(if: $isResourceGroupsEmpty) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "889ba0e670039fa4a19f21993fd11dea";

export default node;
