/**
 * @generated SignedSource<<922d3470225c508d75bffab3c753b94f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionCountDashboardItemRefetchQuery$variables = {
  batchFilter?: string | null | undefined;
  inferenceFilter?: string | null | undefined;
  interactiveFilter?: string | null | undefined;
  scopeId?: any | null | undefined;
  systemFilter?: string | null | undefined;
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
    "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"batch\"",
    "kind": "LocalArgument",
    "name": "batchFilter"
  },
  {
    "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"inference\"",
    "kind": "LocalArgument",
    "name": "inferenceFilter"
  },
  {
    "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"interactive\"",
    "kind": "LocalArgument",
    "name": "interactiveFilter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scopeId"
  },
  {
    "defaultValue": "status != \"TERMINATED\" & status != \"CANCELLED\" & type == \"system\"",
    "kind": "LocalArgument",
    "name": "systemFilter"
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
            "name": "batchFilter",
            "variableName": "batchFilter"
          },
          {
            "kind": "Variable",
            "name": "inferenceFilter",
            "variableName": "inferenceFilter"
          },
          {
            "kind": "Variable",
            "name": "interactiveFilter",
            "variableName": "interactiveFilter"
          },
          {
            "kind": "Variable",
            "name": "scopeId",
            "variableName": "scopeId"
          },
          {
            "kind": "Variable",
            "name": "systemFilter",
            "variableName": "systemFilter"
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
            "kind": "Variable",
            "name": "filter",
            "variableName": "interactiveFilter"
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
            "kind": "Variable",
            "name": "filter",
            "variableName": "batchFilter"
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
            "kind": "Variable",
            "name": "filter",
            "variableName": "inferenceFilter"
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
            "kind": "Variable",
            "name": "filter",
            "variableName": "systemFilter"
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
    "cacheID": "e6cc3327cd077002dec6704b3313653a",
    "id": null,
    "metadata": {},
    "name": "SessionCountDashboardItemRefetchQuery",
    "operationKind": "query",
    "text": "query SessionCountDashboardItemRefetchQuery(\n  $batchFilter: String = \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"batch\\\"\"\n  $inferenceFilter: String = \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"inference\\\"\"\n  $interactiveFilter: String = \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"interactive\\\"\"\n  $scopeId: ScopeField\n  $systemFilter: String = \"status != \\\"TERMINATED\\\" & status != \\\"CANCELLED\\\" & type == \\\"system\\\"\"\n) {\n  ...SessionCountDashboardItemFragment_3INTnW\n}\n\nfragment SessionCountDashboardItemFragment_3INTnW on Query {\n  myInteractive: compute_session_nodes(first: 0, filter: $interactiveFilter, scope_id: $scopeId) {\n    count\n  }\n  myBatch: compute_session_nodes(first: 0, filter: $batchFilter, scope_id: $scopeId) {\n    count\n  }\n  myInference: compute_session_nodes(first: 0, filter: $inferenceFilter, scope_id: $scopeId) {\n    count\n  }\n  myUpload: compute_session_nodes(first: 0, filter: $systemFilter, scope_id: $scopeId) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "62fd6c06a208e3f17511370116de6c21";

export default node;
