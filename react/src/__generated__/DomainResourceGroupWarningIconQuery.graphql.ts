/**
 * @generated SignedSource<<63b5230536266fdad2de1697cf3b857a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupWarningIconQuery$variables = {
  domainName: string;
  isSuperAdmin: boolean;
};
export type DomainResourceGroupWarningIconQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly domain?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type DomainResourceGroupWarningIconQuery = {
  response: DomainResourceGroupWarningIconQuery$data;
  variables: DomainResourceGroupWarningIconQuery$variables;
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
    "name": "isSuperAdmin"
  }
],
v1 = [
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domainName",
            "variableName": "domainName"
          }
        ],
        "concreteType": "AllowedResourceGroupsPayload",
        "kind": "LinkedField",
        "name": "adminAllowedResourceGroupsForDomainV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "items",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "name",
            "variableName": "domainName"
          }
        ],
        "concreteType": "Domain",
        "kind": "LinkedField",
        "name": "domain",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_groups",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DomainResourceGroupWarningIconQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DomainResourceGroupWarningIconQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8e28f1a53bb0137f376a01d42330d25d",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupWarningIconQuery(\n  $domainName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $isSuperAdmin) {\n    items\n  }\n  domain(name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "121c7c14cc0d2017430e34a83100b65f";

export default node;
