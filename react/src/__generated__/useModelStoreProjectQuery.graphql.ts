/**
 * @generated SignedSource<<bbf7fb3868abeab75540d7c770ecf843>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useModelStoreProjectQuery$variables = {
  domainName: string;
};
export type useModelStoreProjectQuery$data = {
  readonly domainV2: {
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
  } | null | undefined;
};
export type useModelStoreProjectQuery = {
  response: useModelStoreProjectQuery$data;
  variables: useModelStoreProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "isActive": true,
        "type": {
          "equals": "MODEL_STORE"
        }
      }
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
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
            (v2/*: any*/),
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
  "storageKey": "projects(filter:{\"isActive\":true,\"type\":{\"equals\":\"MODEL_STORE\"}})"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useModelStoreProjectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f25d7d141d4fd27e5938a63e66a9cd3f",
    "id": null,
    "metadata": {},
    "name": "useModelStoreProjectQuery",
    "operationKind": "query",
    "text": "query useModelStoreProjectQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    projects(filter: {type: {equals: MODEL_STORE}, isActive: true}) {\n      edges {\n        node {\n          id\n          basicInfo {\n            name\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b7c7bda37035dd1f39bf80a9e4caeb1b";

export default node;
