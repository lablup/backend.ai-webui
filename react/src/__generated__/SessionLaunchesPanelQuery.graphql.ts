/**
 * @generated SignedSource<<b5bae54deccbeeda20a2591cbd2ff5b0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type SessionLaunchesPanelQuery$variables = {
  failed: string;
  pending: string;
  sampleSize: number;
  scopeId?: any | null | undefined;
  started: string;
};
export type SessionLaunchesPanelQuery$data = {
  readonly failed: Result<{
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
  "name": "failed"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pending"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sampleSize"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "started"
},
v5 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v6 = {
  "kind": "Variable",
  "name": "scope_id",
  "variableName": "scopeId"
},
v7 = [
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
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "order",
    "value": "-created_at"
  },
  (v6/*: any*/)
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scheduled_at",
  "storageKey": null
},
v11 = {
  "kind": "Literal",
  "name": "first",
  "value": 1
},
v12 = [
  (v8/*: any*/)
],
v13 = {
  "alias": "failed",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "failed"
    },
    (v11/*: any*/),
    (v5/*: any*/),
    (v6/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
},
v14 = {
  "alias": "pending",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "pending"
    },
    (v11/*: any*/),
    (v5/*: any*/),
    (v6/*: any*/)
  ],
  "concreteType": "ComputeSessionConnection",
  "kind": "LinkedField",
  "name": "compute_session_nodes",
  "plural": false,
  "selections": (v12/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionLaunchesPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "started",
          "args": (v7/*: any*/),
          "concreteType": "ComputeSessionConnection",
          "kind": "LinkedField",
          "name": "compute_session_nodes",
          "plural": false,
          "selections": [
            (v8/*: any*/),
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
                    (v9/*: any*/),
                    (v10/*: any*/)
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
        "field": (v13/*: any*/),
        "to": "RESULT"
      },
      {
        "kind": "CatchField",
        "field": (v14/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionLaunchesPanelQuery",
    "selections": [
      {
        "alias": "started",
        "args": (v7/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          (v8/*: any*/),
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
                  (v9/*: any*/),
                  (v10/*: any*/),
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
      (v13/*: any*/),
      (v14/*: any*/)
    ]
  },
  "params": {
    "cacheID": "414bfd174fe76ce397837599f838e2a2",
    "id": null,
    "metadata": {},
    "name": "SessionLaunchesPanelQuery",
    "operationKind": "query",
    "text": "query SessionLaunchesPanelQuery(\n  $scopeId: ScopeField\n  $started: String!\n  $failed: String!\n  $pending: String!\n  $sampleSize: Int!\n) {\n  started: compute_session_nodes(scope_id: $scopeId, first: $sampleSize, offset: 0, filter: $started, order: \"-created_at\") {\n    count\n    edges {\n      node {\n        created_at\n        scheduled_at\n        id\n      }\n    }\n  }\n  failed: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $failed) {\n    count\n  }\n  pending: compute_session_nodes(scope_id: $scopeId, first: 1, offset: 0, filter: $pending) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "0c37fa3617773048309a34cd1e26c3de";

export default node;
