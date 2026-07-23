/**
 * @generated SignedSource<<3ce41e904c0046d69a08da6013169d66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalDomainQuery$variables = {
  is_active?: boolean | null | undefined;
};
export type RoleFormModalDomainQuery$data = {
  readonly domains: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type RoleFormModalDomainQuery = {
  response: RoleFormModalDomainQuery$data;
  variables: RoleFormModalDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "is_active"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "is_active",
        "variableName": "is_active"
      }
    ],
    "concreteType": "Domain",
    "kind": "LinkedField",
    "name": "domains",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
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
    "name": "RoleFormModalDomainQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalDomainQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b6c5e7cdf31fb34fe1bef6fc11e85730",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalDomainQuery",
    "operationKind": "query",
    "text": "query RoleFormModalDomainQuery(\n  $is_active: Boolean\n) {\n  domains(is_active: $is_active) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "77b5f4064ab46b44d4f562a75c6bde73";

export default node;
