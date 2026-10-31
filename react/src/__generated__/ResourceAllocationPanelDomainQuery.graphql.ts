/**
 * @generated SignedSource<<d43438301c2e003871371a2951560121>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceAllocationPanelDomainQuery$variables = {
  domainName: string;
};
export type ResourceAllocationPanelDomainQuery$data = {
  readonly adminDomainResourceAllocationV2: {
    readonly domain: {
      readonly limits: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined;
};
export type ResourceAllocationPanelDomainQuery = {
  response: ResourceAllocationPanelDomainQuery$data;
  variables: ResourceAllocationPanelDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      }
    ],
    "concreteType": "DomainResourceAllocationV2",
    "kind": "LinkedField",
    "name": "adminDomainResourceAllocationV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeResourceUsageV2",
        "kind": "LinkedField",
        "name": "domain",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceLimitEntry",
            "kind": "LinkedField",
            "name": "limits",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "unlimited",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceSlotEntry",
            "kind": "LinkedField",
            "name": "used",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
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
    "name": "ResourceAllocationPanelDomainQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceAllocationPanelDomainQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "59bafb5f609dd9651569b6a20cc066da",
    "id": null,
    "metadata": {},
    "name": "ResourceAllocationPanelDomainQuery",
    "operationKind": "query",
    "text": "query ResourceAllocationPanelDomainQuery(\n  $domainName: String!\n) {\n  adminDomainResourceAllocationV2(domainName: $domainName) {\n    domain {\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      used {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bd7ac4fd20b26db86ffa415e4550578e";

export default node;
