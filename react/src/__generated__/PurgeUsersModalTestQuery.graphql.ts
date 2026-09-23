/**
 * @generated SignedSource<<3a8f2fe54f06e75726babb51ed1ee1d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PurgeUsersModalTestQuery$variables = Record<PropertyKey, never>;
export type PurgeUsersModalTestQuery$data = {
  readonly adminUsersV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"PurgeUsersModalFragment">;
      };
    }>;
  } | null | undefined;
};
export type PurgeUsersModalTestQuery = {
  response: PurgeUsersModalTestQuery$data;
  variables: PurgeUsersModalTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PurgeUsersModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "adminUsersV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "PurgeUsersModalFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminUsersV2(limit:1)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PurgeUsersModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "adminUsersV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2",
                "kind": "LinkedField",
                "name": "node",
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
                    "concreteType": "UserV2BasicInfo",
                    "kind": "LinkedField",
                    "name": "basicInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "email",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminUsersV2(limit:1)"
      }
    ]
  },
  "params": {
    "cacheID": "bc008a0cfca5f1fc14ea9e726aaa6e70",
    "id": null,
    "metadata": {},
    "name": "PurgeUsersModalTestQuery",
    "operationKind": "query",
    "text": "query PurgeUsersModalTestQuery {\n  adminUsersV2(limit: 1) {\n    edges {\n      node {\n        ...PurgeUsersModalFragment\n        id\n      }\n    }\n  }\n}\n\nfragment PurgeUsersModalFragment on UserV2 {\n  id\n  basicInfo {\n    email\n  }\n}\n"
  }
};
})();

(node as any).hash = "d177d79b45b0f4ac908d534a8a3339ac";

export default node;
