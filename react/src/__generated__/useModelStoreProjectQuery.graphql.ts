/**
 * @generated SignedSource<<5335f872143df4d6ecc6f5463b252289>>
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
  isAdminScope: boolean;
  userId: string;
};
export type useModelStoreProjectQuery$data = {
  readonly domainProjectsV2?: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined, unknown>;
  readonly scopedProjectsV2?: Result<{
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
  "name": "isAdminScope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v3 = {
  "equals": "MODEL_STORE"
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
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "domainName"
            }
          ],
          "kind": "ObjectValue",
          "name": "domainName"
        },
        {
          "kind": "Literal",
          "name": "isActive",
          "value": true
        },
        {
          "kind": "Literal",
          "name": "type",
          "value": (v3/*: any*/)
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
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
v6 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true,
        "type": (v3/*: any*/)
      }
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 1
    },
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "domainName",
          "variableName": "domainName"
        }
      ],
      "kind": "ObjectValue",
      "name": "scope"
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "domainProjectsV2",
  "plural": false,
  "selections": (v4/*: any*/),
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
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "condition": "isAdminScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v5/*: any*/),
            "to": "RESULT"
          }
        ]
      },
      {
        "condition": "isAdminScope",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v6/*: any*/),
            "to": "RESULT"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "condition": "isAdminScope",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          (v5/*: any*/)
        ]
      },
      {
        "condition": "isAdminScope",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v6/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "cb18b3d0fb190674d09b5f10ddc42575",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $userId: UUID!\n  $domainName: String!\n  $isAdminScope: Boolean!\n) {\n  scopedProjectsV2(scope: {user: [{value: $userId}]}, filter: {type: {equals: MODEL_STORE}, isActive: true, domainName: {equals: $domainName}}) @skip(if: $isAdminScope) @since(version: \"26.9.0a1\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  domainProjectsV2(scope: {domainName: $domainName}, filter: {type: {equals: MODEL_STORE}, isActive: true}, limit: 1) @include(if: $isAdminScope) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8631cbf7edc5936dca38b71b7a45158e";

export default node;
