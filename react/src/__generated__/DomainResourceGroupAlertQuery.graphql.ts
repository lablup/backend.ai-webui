/**
 * @generated SignedSource<<16bec9232acce267985870fa3be78930>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupAlertQuery$variables = {
  domainName: string;
  supportsAllowedResourceGroupsV2: boolean;
};
export type DomainResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly domain?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type DomainResourceGroupAlertQuery = {
  response: DomainResourceGroupAlertQuery$data;
  variables: DomainResourceGroupAlertQuery$variables;
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
    "name": "supportsAllowedResourceGroupsV2"
  }
],
v1 = [
  {
    "condition": "supportsAllowedResourceGroupsV2",
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
    "condition": "supportsAllowedResourceGroupsV2",
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
    "name": "DomainResourceGroupAlertQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DomainResourceGroupAlertQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "01676193181d473116548009217dfbf6",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupAlertQuery(\n  $domainName: String!\n  $supportsAllowedResourceGroupsV2: Boolean!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  domain(name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "e4c66b8025af6b1a18f6883a63e7a6a1";

export default node;
