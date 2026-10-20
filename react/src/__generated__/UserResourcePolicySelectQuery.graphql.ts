/**
 * @generated SignedSource<<701b0b426ee50216e63974c57c2c0c19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
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
  } | null | undefined> | null | undefined;
};
export type UserResourcePolicySelectQuery = {
  response: UserResourcePolicySelectQuery$data;
  variables: UserResourcePolicySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "UserResourcePolicy",
    "kind": "LinkedField",
    "name": "user_resource_policies",
    "plural": true,
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
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "created_at",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_vfolder_count",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_session_count_per_model_session",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_quota_scope_size",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_customized_image_count",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourcePolicySelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserResourcePolicySelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "9dfe965d8dfbafbfbe865685d981fe04",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySelectQuery",
    "operationKind": "query",
    "text": "query UserResourcePolicySelectQuery {\n  user_resource_policies {\n    id\n    name\n    created_at\n    max_vfolder_count\n    max_session_count_per_model_session\n    max_quota_scope_size\n    max_customized_image_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "ae141e3363c8ae47e2c29f16f28e53ea";

export default node;
