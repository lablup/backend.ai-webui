/**
 * @generated SignedSource<<d89fb233e94f17ecd107879c645c7b3e>>
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
          "value": {
            "equals": "MODEL_STORE"
          }
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
  "selections": [
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
        "field": (v2/*: any*/),
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
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "9ce33d5ff597c0d1628b63b0f8e137bd",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $userId: UUID!\n  $domainName: String!\n) {\n  scopedProjectsV2(scope: {user: [{value: $userId}]}, filter: {type: {equals: MODEL_STORE}, isActive: true, domainName: {equals: $domainName}}) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0f1ef5fc0ae0de2e320b5cbd265f5b4d";

export default node;
