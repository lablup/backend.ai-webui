/**
 * @generated SignedSource<<ac86584c4fea3f1e069aef5ad98f0365>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type StorageHostCustomQuotaAddingModalQuery$variables = {
  is_active?: boolean | null;
  limit: number;
  offset: number;
};
export type StorageHostCustomQuotaAddingModalQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly id: any | null;
  } | null> | null;
  readonly user_list: {
    readonly items: ReadonlyArray<{
      readonly id: string | null;
    } | null>;
  } | null;
};
export type StorageHostCustomQuotaAddingModalQuery = {
  response: StorageHostCustomQuotaAddingModalQuery$data;
  variables: StorageHostCustomQuotaAddingModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "is_active"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
],
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "groups",
    "plural": true,
    "selections": (v3/*: any*/),
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
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
      }
    ],
    "concreteType": "UserList",
    "kind": "LinkedField",
    "name": "user_list",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "StorageHostCustomQuotaAddingModalQuery",
    "selections": (v4/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "StorageHostCustomQuotaAddingModalQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "f550de0230f691c9f417ab7181fba2b9",
    "id": null,
    "metadata": {},
    "name": "StorageHostCustomQuotaAddingModalQuery",
    "operationKind": "query",
    "text": "query StorageHostCustomQuotaAddingModalQuery(\n  $limit: Int!\n  $offset: Int!\n  $is_active: Boolean\n) {\n  groups {\n    id\n  }\n  user_list(limit: $limit, offset: $offset, is_active: $is_active) {\n    items {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6df1fe729b519b6909a17106aed396b2";

export default node;
