/**
 * @generated SignedSource<<3711debf28a8f6ab7b06c417bf6b55d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminUserSelectDomainIdQuery$variables = {
  domainName: string;
};
export type BAIAdminUserSelectDomainIdQuery$data = {
  readonly domainV2: {
    readonly entityId: string;
  } | null | undefined;
};
export type BAIAdminUserSelectDomainIdQuery = {
  response: BAIAdminUserSelectDomainIdQuery$data;
  variables: BAIAdminUserSelectDomainIdQuery$variables;
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
    "name": "BAIAdminUserSelectDomainIdQuery",
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
    "name": "BAIAdminUserSelectDomainIdQuery",
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
    "cacheID": "9c8907824a806b5a08554c0e53a1ff0b",
    "id": null,
    "metadata": {},
    "name": "BAIAdminUserSelectDomainIdQuery",
    "operationKind": "query",
    "text": "query BAIAdminUserSelectDomainIdQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "faaac11062d5382c01164439d6192723";

export default node;
