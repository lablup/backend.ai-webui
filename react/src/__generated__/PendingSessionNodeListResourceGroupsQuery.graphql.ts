/**
 * @generated SignedSource<<40b59559db4ac277bb7e4a7bb4d971d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PendingSessionNodeListResourceGroupsQuery$variables = Record<PropertyKey, never>;
export type PendingSessionNodeListResourceGroupsQuery$data = {
  readonly scaling_groups: ReadonlyArray<{
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type PendingSessionNodeListResourceGroupsQuery = {
  response: PendingSessionNodeListResourceGroupsQuery$data;
  variables: PendingSessionNodeListResourceGroupsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "is_active",
        "value": true
      }
    ],
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
    "storageKey": "scaling_groups(is_active:true)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PendingSessionNodeListResourceGroupsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PendingSessionNodeListResourceGroupsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "7b612f4c9bf246c02fc1acb3e684362a",
    "id": null,
    "metadata": {},
    "name": "PendingSessionNodeListResourceGroupsQuery",
    "operationKind": "query",
    "text": "query PendingSessionNodeListResourceGroupsQuery {\n  scaling_groups(is_active: true) {\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "352efab68a3b665ac2995880b6aeeae0";

export default node;
