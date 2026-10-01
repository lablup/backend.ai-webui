/**
 * @generated SignedSource<<d9feff05ced269b085d4e35ef1b164f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupAlertQuery$variables = {
  domainName: string;
  isSuperAdmin: boolean;
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
    "cacheID": "cc324a5a5ec13ae393c2de03233c298b",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupAlertQuery(\n  $domainName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $isSuperAdmin) {\n    items\n  }\n  domain(name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5ebd4fc6d910fd54fdca634d5451ba6";

export default node;
