/**
 * @generated SignedSource<<96b7561643f9868bad8eaad95839624c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupWarningIconQuery$variables = {
  domainName: string;
};
export type DomainResourceGroupWarningIconQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2: {
    readonly items: ReadonlyArray<string>;
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
    "cacheID": "065b8add679d608934a5392be016fc5b",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupWarningIconQuery(\n  $domainName: String!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "2626f22516604986db4a8c632f2cf97c";

export default node;
