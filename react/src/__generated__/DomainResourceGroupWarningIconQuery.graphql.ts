/**
 * @generated SignedSource<<a350a721947e970f608ae9403fbdcf6c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupWarningIconQuery$variables = {
  domainName?: string | null | undefined;
};
export type DomainResourceGroupWarningIconQuery$data = {
  readonly domain: {
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
    "cacheID": "86ffe1e7372a5788a3fe6da38335581d",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupWarningIconQuery(\n  $domainName: String\n) {\n  domain(name: $domainName) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "1bb1f1f7fc2b25422095a260da8359ef";

export default node;
