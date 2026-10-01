/**
 * @generated SignedSource<<a05568689c34ff1c3e3d8bf05614690a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareCreateModalQuery$variables = Record<PropertyKey, never>;
export type EntityShareCreateModalQuery$data = {
  readonly entityTypes: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }>;
};
export type EntityShareCreateModalQuery = {
  response: EntityShareCreateModalQuery$data;
  variables: EntityShareCreateModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "EntityType",
    "kind": "LinkedField",
    "name": "entityTypes",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
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
    "name": "EntityShareCreateModalQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "EntityShareCreateModalQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "809dca1b8362f151385a6013642b70d2",
    "id": null,
    "metadata": {},
    "name": "EntityShareCreateModalQuery",
    "operationKind": "query",
    "text": "query EntityShareCreateModalQuery {\n  entityTypes {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcedd4231b8084466190b3a341b6e076";

export default node;
