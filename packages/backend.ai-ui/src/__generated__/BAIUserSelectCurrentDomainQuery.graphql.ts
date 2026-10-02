/**
 * @generated SignedSource<<c6dc38cca8bc25b857058536673399f1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectCurrentDomainQuery$variables = {
  domainName: string;
  skip: boolean;
};
export type BAIUserSelectCurrentDomainQuery$data = {
  readonly domainV2?: {
    readonly entityId: string;
  } | null | undefined;
};
export type BAIUserSelectCurrentDomainQuery = {
  response: BAIUserSelectCurrentDomainQuery$data;
  variables: BAIUserSelectCurrentDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
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
  "name": "entityId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIUserSelectCurrentDomainQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domainV2",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIUserSelectCurrentDomainQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": "DomainV2",
            "kind": "LinkedField",
            "name": "domainV2",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "2257a97980552174326033f2bed6e574",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectCurrentDomainQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectCurrentDomainQuery(\n  $domainName: String!\n  $skip: Boolean!\n) {\n  domainV2(domainName: $domainName) @skip(if: $skip) {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "16aae09024339b6a770cdf48005fbfdf";

export default node;
