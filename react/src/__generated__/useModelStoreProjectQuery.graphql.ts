/**
 * @generated SignedSource<<905ef59c2966e2779fc7b2629de34923>>
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
  readonly legacyGroups: Result<ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined, unknown>;
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
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
              (v4/*: any*/)
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
v6 = {
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
  "selections": (v5/*: any*/),
  "storageKey": null
},
v7 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v8 = {
  "alias": null,
  "args": [
    (v2/*: any*/)
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": (v5/*: any*/),
  "storageKey": "projects(filter:{\"isActive\":true,\"type\":{\"equals\":\"MODEL_STORE\"}})"
},
v9 = {
  "alias": "legacyGroups",
  "args": [
    {
      "kind": "Variable",
      "name": "domain_name",
      "variableName": "domainName"
    },
    {
      "kind": "Literal",
      "name": "is_active",
      "value": true
    },
    {
      "kind": "Literal",
      "name": "type",
      "value": [
        "MODEL_STORE"
      ]
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v3/*: any*/),
    (v4/*: any*/)
  ],
  "storageKey": null
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
        "field": (v6/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v7/*: any*/),
          "concreteType": "DomainV2",
          "kind": "LinkedField",
          "name": "domainV2",
          "plural": false,
          "selections": [
            (v8/*: any*/)
          ],
          "storageKey": null
        },
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v9/*: any*/),
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
      (v6/*: any*/),
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      },
      (v9/*: any*/)
    ]
  },
  "params": {
    "cacheID": "c8c5b9ef338276a1072e55361bb2a5e0",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $userId: UUID!\n  $domainName: String!\n) {\n  scopedProjectsV2(scope: {user: [{value: $userId}]}, filter: {type: {equals: MODEL_STORE}, isActive: true}) @since(version: \"26.9.0a1\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  domainV2(domainName: $domainName) @since(version: \"26.2.0\") @deprecatedSince(version: \"26.9.0a1\") {\n    projects(filter: {type: {equals: MODEL_STORE}, isActive: true}) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n  legacyGroups: groups(domain_name: $domainName, is_active: true, type: [\"MODEL_STORE\"]) @deprecatedSince(version: \"26.2.0\") {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "4b818bca881f329c4a5dc626df691600";

export default node;
