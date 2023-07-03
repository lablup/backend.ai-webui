/**
 * @generated SignedSource<<4f6a876bb5a00827d8169adf77a9539b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type QuotaSettingModalQuery$variables = {
  project_resource_policy_name: string;
  skipProjectResourcePolicy: boolean;
  skipUserResourcePolicy: boolean;
  user_resource_policy_name?: string | null;
};
export type QuotaSettingModalQuery$data = {
  readonly project_resource_policy?: {
    readonly max_vfolder_size: any | null;
  } | null;
  readonly user_resource_policy?: {
    readonly max_vfolder_size: any | null;
  } | null;
};
export type QuotaSettingModalQuery = {
  response: QuotaSettingModalQuery$data;
  variables: QuotaSettingModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "project_resource_policy_name"
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
  "name": "user_resource_policy_name"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "max_vfolder_size",
    "storageKey": null
  }
],
v5 = [
  {
    "condition": "skipProjectResourcePolicy",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "name",
            "variableName": "project_resource_policy_name"
          }
        ],
        "concreteType": "ProjectResourcePolicy",
        "kind": "LinkedField",
        "name": "project_resource_policy",
        "plural": false,
        "selections": (v4/*: any*/),
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
        "args": [
          {
            "kind": "Variable",
            "name": "name",
            "variableName": "user_resource_policy_name"
          }
        ],
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": (v4/*: any*/),
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
    "name": "QuotaSettingModalQuery",
    "selections": (v5/*: any*/),
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
    "name": "QuotaSettingModalQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "cb7c93a9af424f65815db0d5dce36e5a",
    "id": null,
    "metadata": {},
    "name": "QuotaSettingModalQuery",
    "operationKind": "query",
    "text": "query QuotaSettingModalQuery(\n  $project_resource_policy_name: String!\n  $user_resource_policy_name: String\n  $skipProjectResourcePolicy: Boolean!\n  $skipUserResourcePolicy: Boolean!\n) {\n  project_resource_policy(name: $project_resource_policy_name) @skip(if: $skipProjectResourcePolicy) {\n    max_vfolder_size\n  }\n  user_resource_policy(name: $user_resource_policy_name) @skip(if: $skipUserResourcePolicy) {\n    max_vfolder_size\n  }\n}\n"
  }
};
})();

(node as any).hash = "bf0177bbf89ed99818c5d2b4823cd47b";

export default node;
