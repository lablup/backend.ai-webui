/**
 * @generated SignedSource<<b84e47103e6bad1d57500d825964278d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIResourceGroupSelectQuery$variables = Record<PropertyKey, never>;
export type BAIResourceGroupSelectQuery$data = {
  readonly scaling_groups: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type BAIResourceGroupSelectQuery = {
  response: BAIResourceGroupSelectQuery$data;
  variables: BAIResourceGroupSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ScalingGroup",
    "kind": "LinkedField",
    "name": "scaling_groups",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIResourceGroupSelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIResourceGroupSelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "e0e2315cadb2e8aa35586ebe588cd9d1",
    "id": null,
    "metadata": {},
    "name": "BAIResourceGroupSelectQuery",
    "operationKind": "query",
    "text": "query BAIResourceGroupSelectQuery {\n  scaling_groups {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "835aef9b1b8293b5cb6fa2e775e8945c";

export default node;
