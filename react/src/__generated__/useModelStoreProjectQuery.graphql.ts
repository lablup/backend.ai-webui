/**
 * @generated SignedSource<<5d96c676b585fb82181829b7d4bd8b91>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type useModelStoreProjectQuery$variables = {
  domainName: string;
  userId: string;
};
export type useModelStoreProjectQuery$data = {
  readonly domainV2: Result<{
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly id: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined, unknown>;
  readonly scopedProjectsV2: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useModelStoreProjectQuery = {
  response: useModelStoreProjectQuery$data;
  variables: useModelStoreProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v2 = {
  "kind": "Literal",
  "name": "filter",
  "value": {
    "isActive": true,
    "type": {
      "equals": "MODEL_STORE"
    }
  }
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ProjectV2Edge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
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
v5 = {
  "alias": null,
  "args": [
    (v2/*: any*/),
    {
      "fields": [
        {
          "items": [
            {
              "fields": [
                {
                  "kind": "Variable",
                  "name": "value",
                  "variableName": "userId"
                }
              ],
              "kind": "ObjectValue",
              "name": "user.0"
            }
          ],
          "kind": "ListValue",
          "name": "user"
        }
      ],
      "kind": "ObjectValue",
      "name": "scope"
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "scopedProjectsV2",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v6 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v7 = {
  "alias": null,
  "args": [
    (v2/*: any*/)
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": (v4/*: any*/),
  "storageKey": "projects(filter:{\"isActive\":true,\"type\":{\"equals\":\"MODEL_STORE\"}})"
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v5/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v6/*: any*/),
          "concreteType": "DomainV2",
          "kind": "LinkedField",
          "name": "domainV2",
          "plural": false,
          "selections": [
            (v7/*: any*/)
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useModelStoreProjectQuery",
    "selections": [
      (v5/*: any*/),
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v7/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cfbcff38c4659acdc5ba05a27e13a461",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $userId: UUID!\n  $domainName: String!\n) {\n  scopedProjectsV2(scope: {user: [{value: $userId}]}, filter: {type: {equals: MODEL_STORE}, isActive: true}) @since(version: \"26.9.0a1\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  domainV2(domainName: $domainName) @deprecatedSince(version: \"26.9.0a1\") {\n    projects(filter: {type: {equals: MODEL_STORE}, isActive: true}) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "72e6b16bbeffe81aafe3f2357db7ea0d";

export default node;
