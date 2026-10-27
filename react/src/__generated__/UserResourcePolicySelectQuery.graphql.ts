/**
 * @generated SignedSource<<01484c822cee5123d9902d193c8daea4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicySelectQuery$variables = Record<PropertyKey, never>;
export type UserResourcePolicySelectQuery$data = {
  readonly user_resource_policies: ReadonlyArray<{
    readonly created_at: string;
    readonly id: string;
    readonly max_customized_image_count: number | null | undefined;
    readonly max_quota_scope_size: any | null | undefined;
    readonly max_session_count_per_model_session: number | null | undefined;
    readonly max_vfolder_count: number | null | undefined;
    readonly name: string;
    readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicySettingModalFragment">;
  } | null | undefined> | null | undefined;
};
export type UserResourcePolicySelectQuery = {
  response: UserResourcePolicySelectQuery$data;
  variables: UserResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_vfolder_count",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_session_count_per_model_session",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_quota_scope_size",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_customized_image_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "UserResourcePolicySettingModalFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserResourcePolicySelectQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policies",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "21fc24af5d2c1f66b16e026ee4f67086",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query UserResourcePolicySelectQuery {\n  user_resource_policies {\n    id\n    name\n    created_at\n    max_vfolder_count\n    max_session_count_per_model_session\n    max_quota_scope_size\n    max_customized_image_count\n    ...UserResourcePolicySettingModalFragment\n  }\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  max_vfolder_count\n  max_session_count_per_model_session\n  max_quota_scope_size\n  max_customized_image_count\n}\n"
  }
};
})();

(node as any).hash = "650dac37b7fa07c0eaaa289b70cb9831";

export default node;
