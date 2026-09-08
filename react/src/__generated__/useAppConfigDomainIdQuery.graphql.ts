/**
 * @generated SignedSource<<5745df8de959c41b9401fb483674904f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigDomainIdQuery$variables = {
  domainName: string;
};
export type useAppConfigDomainIdQuery$data = {
  readonly domainV2: {
    readonly entityId: string;
  } | null | undefined;
};
export type useAppConfigDomainIdQuery = {
  response: useAppConfigDomainIdQuery$data;
  variables: useAppConfigDomainIdQuery$variables;
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
    "name": "useAppConfigDomainIdQuery",
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
    "name": "useAppConfigDomainIdQuery",
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
    "cacheID": "cf1da8ee401ca4e0da518906386d8647",
    "id": null,
    "metadata": {},
    "name": "useAppConfigDomainIdQuery",
    "operationKind": "query",
    "text": "query useAppConfigDomainIdQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "33ce8ef9d3e020431ab23787dc75b8e2";

export default node;
