/**
 * @generated SignedSource<<294bc391028514b6b4772ecdb4bbe2a1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TerminateSessionModalRefetchQuery$variables = {
  id: any;
  scope_id?: any | null | undefined;
};
export type TerminateSessionModalRefetchQuery$data = {
  readonly compute_session_node: {
    readonly id: string;
    readonly status: string | null | undefined;
  } | null | undefined;
};
export type TerminateSessionModalRefetchQuery = {
  response: TerminateSessionModalRefetchQuery$data;
  variables: TerminateSessionModalRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope_id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "scope_id",
        "variableName": "scope_id"
      }
    ],
    "concreteType": "ComputeSessionNode",
    "kind": "LinkedField",
    "name": "compute_session_node",
    "plural": false,
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
        "name": "status",
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
    "name": "TerminateSessionModalRefetchQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TerminateSessionModalRefetchQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "51cad64543a039e8a62307685efe69dc",
    "id": null,
    "metadata": {},
    "name": "TerminateSessionModalRefetchQuery",
    "operationKind": "query",
    "text": "query TerminateSessionModalRefetchQuery(\n  $id: GlobalIDField!\n  $scope_id: ScopeField\n) {\n  compute_session_node(id: $id, scope_id: $scope_id) {\n    id\n    status\n  }\n}\n"
  }
};
})();

(node as any).hash = "da339597dbd928c66e93679a13f69b0b";

export default node;
