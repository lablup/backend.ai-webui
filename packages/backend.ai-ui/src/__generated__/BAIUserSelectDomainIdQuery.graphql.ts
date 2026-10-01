/**
 * @generated SignedSource<<29e64a50b6e9938aa76b11df51f90156>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIUserSelectDomainIdQuery$variables = {
  domainName: string;
};
export type BAIUserSelectDomainIdQuery$data = {
  readonly domainV2: {
    readonly entityId: string;
  } | null | undefined;
};
export type BAIUserSelectDomainIdQuery = {
  response: BAIUserSelectDomainIdQuery$data;
  variables: BAIUserSelectDomainIdQuery$variables;
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
  "name": "entityId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIUserSelectDomainIdQuery",
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIUserSelectDomainIdQuery",
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
  },
  "params": {
    "cacheID": "fed69b10d0f2a068001edc680059b5ac",
    "id": null,
    "metadata": {},
    "name": "BAIUserSelectDomainIdQuery",
    "operationKind": "query",
    "text": "query BAIUserSelectDomainIdQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a11d3e9cd28a5e499cb75c1819cf744f";

export default node;
