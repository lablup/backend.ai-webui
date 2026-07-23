/**
 * @generated SignedSource<<dfa52f4caeae7214538e84b9fc2d853b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AdminUserCredentialListQuery$variables = {
  domain_name?: string | null | undefined;
  email?: string | null | undefined;
  filter?: string | null | undefined;
  is_active?: boolean | null | undefined;
  limit: number;
  offset: number;
  order?: string | null | undefined;
};
export type AdminUserCredentialListQuery$data = {
  readonly keypair_list: {
    readonly items: ReadonlyArray<{
      readonly access_key: string | null | undefined;
      readonly concurrency_used: number | null | undefined;
      readonly created_at: string | null | undefined;
      readonly id: string | null | undefined;
      readonly is_admin: boolean | null | undefined;
      readonly num_queries: number | null | undefined;
      readonly rate_limit: number | null | undefined;
      readonly resource_policy: string | null | undefined;
      readonly user_id: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"KeypairInfoModalFragment" | "KeypairSettingModalFragment">;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type AdminUserCredentialListQuery = {
  response: AdminUserCredentialListQuery$data;
  variables: AdminUserCredentialListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domain_name"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "email"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "is_active"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v7 = [
  {
    "kind": "Variable",
    "name": "domain_name",
    "variableName": "domain_name"
  },
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  },
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "is_active",
    "variableName": "is_active"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "access_key",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_admin",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_policy",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rate_limit",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "num_queries",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "concurrency_used",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUserCredentialListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "KeyPairList",
        "kind": "LinkedField",
        "name": "keypair_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "KeypairSettingModalFragment"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "KeypairInfoModalFragment"
              }
            ],
            "storageKey": null
          },
          (v17/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v2/*: any*/),
      (v6/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminUserCredentialListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "KeyPairList",
        "kind": "LinkedField",
        "name": "keypair_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPair",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "secret_key",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "last_used",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v17/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9b0b09e3aec9f280a70e92c7c588fe99",
    "id": null,
    "metadata": {},
    "name": "AdminUserCredentialListQuery",
    "operationKind": "query",
    "text": "query AdminUserCredentialListQuery(\n  $limit: Int!\n  $offset: Int!\n  $filter: String\n  $order: String\n  $domain_name: String\n  $email: String\n  $is_active: Boolean\n) {\n  keypair_list(limit: $limit, offset: $offset, filter: $filter, order: $order, domain_name: $domain_name, email: $email, is_active: $is_active) {\n    items {\n      id\n      user_id\n      access_key\n      is_admin\n      resource_policy\n      created_at\n      rate_limit\n      num_queries\n      concurrency_used @since(version: \"24.09.0\")\n      ...KeypairSettingModalFragment\n      ...KeypairInfoModalFragment\n    }\n    total_count\n  }\n}\n\nfragment KeypairInfoModalFragment on KeyPair {\n  user_id\n  access_key\n  secret_key\n  is_admin\n  created_at\n  last_used\n  resource_policy\n  num_queries\n  rate_limit\n  concurrency_used @since(version: \"24.09.0\")\n}\n\nfragment KeypairSettingModalFragment on KeyPair {\n  rate_limit\n  access_key\n  resource_policy\n}\n"
  }
};
})();

(node as any).hash = "fbddc986c4cbe89b00791f105de1772b";

export default node;
