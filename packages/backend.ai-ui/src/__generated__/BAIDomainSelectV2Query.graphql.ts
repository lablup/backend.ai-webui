/**
 * @generated SignedSource<<ecefbe87d92d9ad550ff790f27c9e14b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDomainSelectV2Query$variables = {
  isActive?: boolean | null | undefined;
  limit: number;
};
export type BAIDomainSelectV2Query$data = {
  readonly adminDomainsV2: {
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
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
      },
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
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
                "kind": "ScalarField",
                "name": "entityId",
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
    "cacheID": "c68c381179513f26b6fb6663698e6e56",
    "id": null,
    "metadata": {},
    "name": "BAIDomainSelectV2Query",
    "operationKind": "query",
    "text": "query BAIDomainSelectV2Query(\n  $isActive: Boolean\n  $limit: Int!\n) {\n  adminDomainsV2(filter: {isActive: $isActive}, limit: $limit) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0f8db6689d173a976ef91e4487eca03c";

export default node;
