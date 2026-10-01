/**
 * @generated SignedSource<<0bab18fb455f01e8aa9795b4fc548123>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainResourceGroupAlertQuery$variables = {
  domainName: string;
};
export type DomainResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2: {
    readonly items: ReadonlyArray<string>;
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
    "cacheID": "f5c21bf179835a91bfe9db5f9315cb18",
    "id": null,
    "metadata": {},
    "name": "DomainResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query DomainResourceGroupAlertQuery(\n  $domainName: String!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "7393ffc98c564ac1eef7372598b4fb46";

export default node;
