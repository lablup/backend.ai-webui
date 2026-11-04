/**
 * @generated SignedSource<<f6883a616899087b74a9d782ced06f4f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionCountDashboardItemRefetchQuery$variables = {
  scopeId?: any | null | undefined;
};
export type SessionCountDashboardItemRefetchQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"SessionCountDashboardItemFragment">;
};
export type SessionCountDashboardItemRefetchQuery = {
  response: SessionCountDashboardItemRefetchQuery$data;
  variables: SessionCountDashboardItemRefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scopeId"
  }
],
v1 = {
  "kind": "Literal",
  "name": "first",
  "value": 0
},
v2 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionCountDashboardItemRefetchQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "scopeId",
            "variableName": "scopeId"
          }
        ],
        "kind": "FragmentSpread",
        "name": "SessionCountDashboardItemFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SessionCountDashboardItemRefetchQuery",
    "selections": [
      {
        "alias": "myInteractive",
        "args": [
          {
            "kind": "Literal",
            "name": "filter",
            "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\""
          },
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myBatch",
        "args": [
          {
            "kind": "Literal",
            "name": "filter",
            "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\""
          },
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myInference",
        "args": [
          {
            "kind": "Literal",
            "name": "filter",
            "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\""
          },
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      },
      {
        "alias": "myUpload",
        "args": [
          {
            "kind": "Literal",
            "name": "filter",
            "value": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\""
          },
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4e2a7d64eccfa5e512354e770190e051",
    "id": null,
    "metadata": {},
    "name": "SessionCountDashboardItemRefetchQuery",
    "operationKind": "query",
    "text": "query SessionCountDashboardItemRefetchQuery(\n  $scopeId: ScopeField\n) {\n  ...SessionCountDashboardItemFragment_3vJUag\n}\n\nfragment SessionCountDashboardItemFragment_3vJUag on Query {\n  myInteractive: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"interactive\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myBatch: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"batch\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myInference: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"inference\\\"\", scope_id: $scopeId) {\n    count\n  }\n  myUpload: compute_session_nodes(first: 0, filter: \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"system\\\"\", scope_id: $scopeId) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "19e666cf346850c01eda18c6889928ae";

export default node;
