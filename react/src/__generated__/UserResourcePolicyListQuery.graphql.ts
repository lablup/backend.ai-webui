/**
 * @generated SignedSource<<3d49d6818a26c02e4fd0210b5e20340f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicyListQuery$variables = Record<PropertyKey, never>;
export type UserResourcePolicyListQuery$data = {
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
export type UserResourcePolicyListQuery = {
  response: UserResourcePolicyListQuery$data;
  variables: UserResourcePolicyListQuery$variables;
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
    "name": "UserResourcePolicyListQuery",
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
    "name": "UserResourcePolicyListQuery",
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
    "cacheID": "00b0583474f74c417b06d53115787d3b",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicyListQuery",
    "operationKind": "query",
    "text": "query UserResourcePolicyListQuery {\n  user_resource_policies {\n    id\n    name\n    created_at\n    max_vfolder_count @since(version: \"23.09.6\")\n    max_session_count_per_model_session @since(version: \"23.09.10\")\n    max_quota_scope_size @since(version: \"23.09.2\")\n    max_customized_image_count @since(version: \"24.03.0\")\n    ...UserResourcePolicySettingModalFragment\n  }\n}\n\nfragment UserResourcePolicySettingModalFragment on UserResourcePolicy {\n  id\n  name\n  max_vfolder_count @since(version: \"23.09.6\")\n  max_session_count_per_model_session @since(version: \"23.09.10\")\n  max_quota_scope_size @since(version: \"23.09.2\")\n  max_customized_image_count @since(version: \"24.03.0\")\n}\n"
  }
};
})();

(node as any).hash = "be57da0a1c15efb970cb1e828500e6dc";

export default node;
