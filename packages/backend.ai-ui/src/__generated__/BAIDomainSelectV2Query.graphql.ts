/**
 * @generated SignedSource<<74f1288ffaef2660eec29b8e014035e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDomainSelectV2Query$variables = {
  isActive?: boolean | null | undefined;
};
export type BAIDomainSelectV2Query$data = {
  readonly adminDomainsV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type BAIDomainSelectV2Query = {
  response: BAIDomainSelectV2Query$data;
  variables: BAIDomainSelectV2Query$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isActive"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "isActive",
            "variableName": "isActive"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      }
    ],
    "concreteType": "DomainV2Connection",
    "kind": "LinkedField",
    "name": "adminDomainsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DomainV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DomainV2",
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
                "concreteType": "DomainBasicInfo",
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDomainSelectV2Query",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDomainSelectV2Query",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c4e5c8625a449e2f1e0f14d42ea01c95",
    "id": null,
    "metadata": {},
    "name": "BAIDomainSelectV2Query",
    "operationKind": "query",
    "text": "query BAIDomainSelectV2Query(\n  $isActive: Boolean\n) {\n  adminDomainsV2(filter: {isActive: $isActive}) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "41a40f7df72ed61abf78b3b4e5550fc0";

export default node;
