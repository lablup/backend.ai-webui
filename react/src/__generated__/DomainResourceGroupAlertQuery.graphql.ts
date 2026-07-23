/**
 * @generated SignedSource<<ba6efd17d82bfd2f1099c569ac9fa000>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupAlertQuery$variables = {
  domainName?: string | null | undefined;
};
export type DomainResourceGroupAlertQuery$data = {
  readonly domain: {
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
  }
],
v1 = [
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
    "cacheID": "957173e27a6fe2ad1d5faabfa22446ed",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupAlertQuery(\n  $domainName: String\n) {\n  domain(name: $domainName) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f7ad0811b89344329942504378b0334";

export default node;
