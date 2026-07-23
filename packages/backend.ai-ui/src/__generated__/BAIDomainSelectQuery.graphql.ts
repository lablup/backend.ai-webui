/**
 * @generated SignedSource<<72537211978861222b33ae1c6d2ad987>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDomainSelectQuery$variables = {
  is_active?: boolean | null | undefined;
};
export type BAIDomainSelectQuery$data = {
  readonly domains: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type BAIDomainSelectQuery = {
  response: BAIDomainSelectQuery$data;
  variables: BAIDomainSelectQuery$variables;
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
    "name": "BAIDomainSelectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDomainSelectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "57d026d6fa8a04c20ffa280feacb762f",
    "id": null,
    "metadata": {},
    "name": "BAIDomainSelectQuery",
    "operationKind": "query",
    "text": "query BAIDomainSelectQuery(\n  $is_active: Boolean\n) {\n  domains(is_active: $is_active) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "dc51af30271ef1276b6aba8998bb5c1b";

export default node;
