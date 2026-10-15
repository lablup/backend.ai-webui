/**
 * @generated SignedSource<<2436de3b785321fcd04c6bea75b76d95>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useLabelableEntityTypesQuery$variables = Record<PropertyKey, never>;
export type useLabelableEntityTypesQuery$data = {
  readonly entityTypes: ReadonlyArray<{
    readonly name: string;
  }>;
};
export type useLabelableEntityTypesQuery = {
  response: useLabelableEntityTypesQuery$data;
  variables: useLabelableEntityTypesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useLabelableEntityTypesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntityType",
        "kind": "LinkedField",
        "name": "entityTypes",
        "plural": true,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useLabelableEntityTypesQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "EntityType",
        "kind": "LinkedField",
        "name": "entityTypes",
        "plural": true,
        "selections": [
          (v0/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "fd26bb4b144bd2b4fe827f64b520918a",
    "id": null,
    "metadata": {},
    "name": "useLabelableEntityTypesQuery",
    "operationKind": "query",
    "text": "query useLabelableEntityTypesQuery {\n  entityTypes {\n    name\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "bb36d1cf2c6236016df87c574f16fc14";

export default node;
