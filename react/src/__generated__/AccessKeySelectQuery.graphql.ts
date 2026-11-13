/**
 * @generated SignedSource<<4fa7f040decfe0fd2717f1838ebf7c63>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AccessKeySelectQuery$variables = {
  userId: string;
};
export type AccessKeySelectQuery$data = {
  readonly adminKeypairsV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessKey: string;
        readonly id: string;
        readonly isActive: boolean | null | undefined;
      };
    }>;
  } | null | undefined;
};
export type AccessKeySelectQuery = {
  response: AccessKeySelectQuery$data;
  variables: AccessKeySelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "equals",
                "variableName": "userId"
              }
            ],
            "kind": "ObjectValue",
            "name": "userId"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      },
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
      }
    ],
    "concreteType": "KeyPairConnection",
    "kind": "LinkedField",
    "name": "adminKeypairsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeyPairV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeyPairV2",
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
                "name": "accessKey",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isActive",
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
    "name": "AccessKeySelectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AccessKeySelectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3624c017c482f55230a5803fdfaa1f20",
    "id": null,
    "metadata": {},
    "name": "AccessKeySelectQuery",
    "operationKind": "query",
    "text": "query AccessKeySelectQuery(\n  $userId: UUID!\n) {\n  adminKeypairsV2(filter: {userId: {equals: $userId}}, limit: 100) {\n    edges {\n      node {\n        id\n        accessKey\n        isActive\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4865f9e5a17b5c9d243e40f04f677ca";

export default node;
