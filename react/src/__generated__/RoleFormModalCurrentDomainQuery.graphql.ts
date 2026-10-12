/**
 * @generated SignedSource<<ac44fa822e4ee5e54290b6eca3a5316f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalCurrentDomainQuery$variables = {
  domainName: string;
};
export type RoleFormModalCurrentDomainQuery$data = {
  readonly domainV2: {
    readonly id: string;
  } | null | undefined;
};
export type RoleFormModalCurrentDomainQuery = {
  response: RoleFormModalCurrentDomainQuery$data;
  variables: RoleFormModalCurrentDomainQuery$variables;
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
    "concreteType": "DomainV2",
    "kind": "LinkedField",
    "name": "domainV2",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d1984d5bc1f542d7e95d98d728b58cfd",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalCurrentDomainQuery",
    "operationKind": "query",
    "text": "query RoleFormModalCurrentDomainQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1a7caf1fa68c4d32c599d0b15cbde63f";

export default node;
