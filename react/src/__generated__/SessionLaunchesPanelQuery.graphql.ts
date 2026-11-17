/**
 * @generated SignedSource<<b33e25e84226c0017b2c1142fe9970ca>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type SessionLaunchesPanelQuery$variables = {
  cancelled: string;
  error: string;
  pending: string;
  sampleSize: number;
  scopeId?: any | null | undefined;
  started: string;
};
export type SessionLaunchesPanelQuery$data = {
  readonly cancelled: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly error: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly pending: Result<{
    readonly count: number | null | undefined;
  } | null | undefined, unknown>;
  readonly started: Result<{
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly created_at: string | null | undefined;
        readonly scheduled_at: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined, unknown>;
};
export type SessionLaunchesPanelQuery = {
  response: SessionLaunchesPanelQuery$data;
  variables: SessionLaunchesPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cancelled"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "error"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pending"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sampleSize"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "started"
},
v6 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v7 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v8 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "started"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "sampleSize"
  },
  (v6/*: any*/),
  {
    "kind": "Literal",
    "name": "order",
    "value": "-created_at"
  },
  (v7/*: any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scheduled_at",
  "storageKey": null
},
v12 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v13 = [
  (v9/*: any*/)
],
v14 = {
  "alias": "cancelled",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "cancelled"
    },
    (v12/*: any*/),
    (v6/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v13/*: any*/),
  "storageKey": null
},
v15 = {
  "alias": "error",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "error"
    },
    (v12/*: any*/),
    (v6/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v13/*: any*/),
  "storageKey": null
},
v16 = {
  "alias": "pending",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "pending"
    },
    (v12/*: any*/),
    (v6/*: any*/),
    (v7/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v13/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionLaunchesPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "started",
          "args": (v8/*: any*/),
          "concreteType": "ComputeSessionConnection",
          "kind": "LinkedField",
          "name": "compute_session_nodes",
          "plural": false,
          "selections": [
            (v9/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "ComputeSessionEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "ComputeSessionNode",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    (v10/*: any*/),
                    (v11/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v14/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v15/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v16/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionLaunchesPanelQuery",
    "selections": [
      {
        "alias": "started",
        "args": (v8/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSessionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ComputeSessionNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v10/*: any*/),
                  (v11/*: any*/),
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/)
    ]
  },
  "params": {
    "cacheID": "70e5dda33e6a7bcd795f1824e574c3f9",
    "id": null,
    "metadata": {},
    "name": "SessionLaunchesPanelQuery",
    "operationKind": "query",
    "text": "query SessionLaunchesPanelQuery(\n  $scopeId: ScopeField\n  $started: String!\n  $cancelled: String!\n  $error: String!\n  $pending: String!\n  $sampleSize: Int!\n) {\n  started: compute_session_nodes(scope_id: $scopeId, first: $sampleSize, offset: 0, filter: $started, order: \"-created_at\") {\n    count\n    edges {\n      node {\n        created_at\n        scheduled_at\n        id\n      }\n    }\n  }\n  cancelled: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $cancelled) {\n    count\n  }\n  error: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $error) {\n    count\n  }\n  pending: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $pending) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "46314760f2f1ac4f03221279595d950f";

export default node;
