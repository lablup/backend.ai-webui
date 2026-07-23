/**
 * @generated SignedSource<<32f05004a3416c2b7e2a6ee3ab7437aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EditableSessionNameRefetchQuery$variables = {
  scope_id?: any | null | undefined;
  sessionId: any;
};
export type EditableSessionNameRefetchQuery$data = {
  readonly compute_session_node: {
    readonly id: string;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type EditableSessionNameRefetchQuery = {
  response: EditableSessionNameRefetchQuery$data;
  variables: EditableSessionNameRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope_id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sessionId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "sessionId"
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
        "name": "name",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "EditableSessionNameRefetchQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "EditableSessionNameRefetchQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "58d69307fe6e70d2c3409231b0279c8b",
    "id": null,
    "metadata": {},
    "name": "EditableSessionNameRefetchQuery",
    "operationKind": "query",
    "text": "query EditableSessionNameRefetchQuery(\n  $sessionId: GlobalIDField!\n  $scope_id: ScopeField\n) {\n  compute_session_node(id: $sessionId, scope_id: $scope_id) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "387b0fe2d9acb6f455335434b59c3e6c";

export default node;
