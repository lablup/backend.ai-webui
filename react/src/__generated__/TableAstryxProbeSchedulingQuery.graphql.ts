/**
 * @generated SignedSource<<0351e6e6c2ddac5036381031842afd55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TableAstryxProbeSchedulingQuery$variables = Record<PropertyKey, never>;
export type TableAstryxProbeSchedulingQuery$data = {
  readonly sessionScopedSchedulingHistories: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type TableAstryxProbeSchedulingQuery = {
  response: TableAstryxProbeSchedulingQuery$data;
  variables: TableAstryxProbeSchedulingQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 5
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  },
  {
    "kind": "Literal",
    "name": "scope",
    "value": {
      "sessionId": "probe-session"
    }
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "TableAstryxProbeSchedulingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionSchedulingHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionSchedulingHistory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAISchedulingHistoryTableFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "sessionScopedSchedulingHistories(limit:5,offset:0,scope:{\"sessionId\":\"probe-session\"})"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "TableAstryxProbeSchedulingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SessionSchedulingHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SessionSchedulingHistory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SubStepResultGQL",
                    "kind": "LinkedField",
                    "name": "subSteps",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "step",
                        "storageKey": null
                      },
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "errorCode",
                        "storageKey": null
                      },
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startedAt",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "endedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "attempts",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "updatedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "fromStatus",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "toStatus",
                    "storageKey": null
                  },
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "phase",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "sessionScopedSchedulingHistories(limit:5,offset:0,scope:{\"sessionId\":\"probe-session\"})"
      }
    ]
  },
  "params": {
    "cacheID": "c779ffd855043fd7baff8896baf58374",
    "id": null,
    "metadata": {},
    "name": "TableAstryxProbeSchedulingQuery",
    "operationKind": "query",
    "text": "query TableAstryxProbeSchedulingQuery {\n  sessionScopedSchedulingHistories(scope: {sessionId: \"probe-session\"}, limit: 5, offset: 0) {\n    count\n    edges {\n      node {\n        ...BAISchedulingHistoryTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory {\n  id\n  attempts\n  createdAt\n  updatedAt\n  fromStatus\n  toStatus\n  message\n  phase\n  result\n}\n\nfragment BAISchedulingHistoryTableFragment on SessionSchedulingHistory {\n  id\n  result\n  subSteps {\n    ...BAISubStepNodesFragment\n  }\n  ...BAISchedulingHistoryNodesFragment\n}\n\nfragment BAISubStepNodesFragment on SubStepResultGQL {\n  step\n  result\n  errorCode\n  message\n  startedAt\n  endedAt\n}\n"
  }
};
})();

(node as any).hash = "6f5a76d8c6be46537f2db0116c42af13";

export default node;
