/**
 * @generated SignedSource<<a173031d6a5920eb522bba7b174da3a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type StorageHostCustomQuotaAddingModalQuery$variables = {
  is_active?: boolean | null;
  limit: number;
  offset: number;
};
export type StorageHostCustomQuotaAddingModalQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ProjectMultiSelectorFragment">;
  } | null> | null;
  readonly user_list: {
    readonly items: ReadonlyArray<{
      readonly " $fragmentSpreads": FragmentRefs<"UserMultiSelectorFragment">;
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
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
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ProjectMultiSelectorFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
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
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "UserMultiSelectorFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
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
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "groups",
        "plural": true,
        "selections": [
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v3/*: any*/),
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
            "selections": [
              (v4/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "username",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a005f70a26700f634da2a4d2829c4d95",
    "id": null,
    "metadata": {},
    "name": "StorageHostCustomQuotaAddingModalQuery",
    "operationKind": "query",
    "text": "query StorageHostCustomQuotaAddingModalQuery(\n  $limit: Int!\n  $offset: Int!\n  $is_active: Boolean\n) {\n  groups {\n    ...ProjectMultiSelectorFragment\n  }\n  user_list(limit: $limit, offset: $offset, is_active: $is_active) {\n    items {\n      ...UserMultiSelectorFragment\n      id\n    }\n  }\n}\n\nfragment ProjectMultiSelectorFragment on Group {\n  id\n  name\n}\n\nfragment UserMultiSelectorFragment on User {\n  id\n  username\n}\n"
  }
};
})();

(node as any).hash = "47aef8ba06080f8490a7b5f72303f615";

export default node;
