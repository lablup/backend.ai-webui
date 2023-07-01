/**
 * @generated SignedSource<<e8430170b95c16dae8862d51cff8a7d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcePolicyCardQuery$variables = {
  project_resource_policy: string;
  skipProjectResourcePolicy: boolean;
  skipUserResourcePolicy: boolean;
  user_resource_policy?: string | null;
};
export type ResourcePolicyCardQuery$data = {
  readonly project_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicySettingModalFragment">;
  } | null;
  readonly user_resource_policy?: {
    readonly max_vfolder_size: any | null;
    readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
  } | null;
};
export type ResourcePolicyCardQuery = {
  response: ResourcePolicyCardQuery$data;
  variables: ResourcePolicyCardQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project_resource_policy"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipProjectResourcePolicy"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipUserResourcePolicy"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_resource_policy"
},
v4 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "project_resource_policy"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_size",
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "user_resource_policy"
  }
],
v7 = [
  (v5/*: any*/),
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
    "name": "name",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "created_at",
    "storageKey": null
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
    "name": "ResourcePolicyCardQuery",
    "selections": [
      {
        "condition": "skipProjectResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ProjectResourcePolicySettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipUserResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": [
              (v5/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserResourcePolicySettingModalFragment"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourcePolicyCardQuery",
    "selections": [
      {
        "condition": "skipProjectResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ProjectResourcePolicy",
            "kind": "LinkedField",
            "name": "project_resource_policy",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "skipUserResourcePolicy",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "UserResourcePolicy",
            "kind": "LinkedField",
            "name": "user_resource_policy",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "61c46ae209ab38c53fb660dba5b6d7cf",
    "id": null,
    "metadata": {},
    "name": "ResourcePolicyCardQuery",
    "operationKind": "query",
    "text": "query ResourcePolicyCardQuery(\n  $project_resource_policy: String!\n  $user_resource_policy: String\n  $skipProjectResourcePolicy: Boolean!\n  $skipUserResourcePolicy: Boolean!\n) {\n  project_resource_policy(name: $project_resource_policy) @skip(if: $skipProjectResourcePolicy) {\n    max_vfolder_size\n    ...ProjectResourcePolicySettingModalFragment\n  }\n  user_resource_policy(name: $user_resource_policy) @skip(if: $skipUserResourcePolicy) {\n    max_vfolder_size\n    ...UserResourcePolicySettingModalFragment\n  }\n}\n\nfragment ProjectResourcePolicySettingModalFragment on ProjectResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  created_at\n  max_vfolder_size\n}\n"
  }
};
})();

(node as any).hash = "e91486683bead2546afa346ee7101be0";

export default node;
