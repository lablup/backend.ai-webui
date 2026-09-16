/**
 * @generated SignedSource<<7107930284942f4d095286015a5bcae2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RBACManagementPageScopeTypesQuery$variables = Record<PropertyKey, never>;
export type RBACManagementPageScopeTypesQuery$data = {
  readonly rbacScopeEntityCombinations: ReadonlyArray<{
    readonly scopeType: string;
  }> | null | undefined;
};
export type RBACManagementPageScopeTypesQuery = {
  response: RBACManagementPageScopeTypesQuery$data;
  variables: RBACManagementPageScopeTypesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ScopeEntityCombination",
    "kind": "LinkedField",
    "name": "rbacScopeEntityCombinations",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scopeType",
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
    "name": "RBACManagementPageScopeTypesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RBACManagementPageScopeTypesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "2f46f69d8487ad3ee27647361884d31e",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPageScopeTypesQuery",
    "operationKind": "query",
    "text": "query RBACManagementPageScopeTypesQuery {\n  rbacScopeEntityCombinations {\n    scopeType\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b4615a24047dcbda47822f035e117ce";

export default node;
