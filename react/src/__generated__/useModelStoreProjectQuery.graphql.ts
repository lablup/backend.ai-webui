/**
 * @generated SignedSource<<a36867902fa02327ea974e0968d6af53>>
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
          readonly entityId: string;
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
        readonly entityId: string;
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
            "kind": "ScalarField",
            "name": "entityId",
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
    "cacheID": "10c95ab49b74d86bea9b339edf0aede0",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $userId: UUID!\n  $domainName: String!\n) {\n  scopedProjectsV2(scope: {user: [{value: $userId}]}, filter: {type: {equals: MODEL_STORE}, isActive: true}) @since(version: \"26.9.0a1\") {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  domainV2(domainName: $domainName) @deprecatedSince(version: \"26.9.0a1\") {\n    projects(filter: {type: {equals: MODEL_STORE}, isActive: true}) {\n      edges {\n        node {\n          id\n          entityId\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "53378a415725b39954098e3ca5244c7b";

export default node;
