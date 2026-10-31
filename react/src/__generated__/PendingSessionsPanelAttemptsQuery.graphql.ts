/**
 * @generated SignedSource<<48dffd73c45fdd96b4f1122335d32975>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionScope = {
  sessionId: string;
};
export type PendingSessionsPanelAttemptsQuery$variables = {
  scope: SessionScope;
};
export type PendingSessionsPanelAttemptsQuery$data = {
  readonly sessionScopedSchedulingHistories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAISchedulingHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type PendingSessionsPanelAttemptsQuery = {
  response: PendingSessionsPanelAttemptsQuery$data;
  variables: PendingSessionsPanelAttemptsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 5
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "UPDATED_AT"
      }
    ]
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PendingSessionsPanelAttemptsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PendingSessionsPanelAttemptsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SessionSchedulingHistoryConnection",
        "kind": "LinkedField",
        "name": "sessionScopedSchedulingHistories",
        "plural": false,
        "selections": [
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "phase",
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
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b1be9eb138eb2abb1fa0476b862f6f1b",
    "id": null,
    "metadata": {},
    "name": "PendingSessionsPanelAttemptsQuery",
    "operationKind": "query",
    "text": "query PendingSessionsPanelAttemptsQuery(\n  $scope: SessionScope!\n) {\n  sessionScopedSchedulingHistories(scope: $scope, orderBy: [{field: UPDATED_AT, direction: DESC}], limit: 5) {\n    edges {\n      node {\n        ...BAISchedulingHistoryTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAISchedulingHistoryNodesFragment on SessionSchedulingHistory {\n  id\n  attempts\n  createdAt\n  updatedAt\n  fromStatus\n  toStatus\n  message\n  phase\n  result\n}\n\nfragment BAISchedulingHistoryTableFragment on SessionSchedulingHistory {\n  id\n  phase\n  result\n  subSteps {\n    step\n    ...BAISubStepNodesFragment\n  }\n  ...BAISchedulingHistoryNodesFragment\n}\n\nfragment BAISubStepNodesFragment on SubStepResultGQL {\n  step\n  result\n  errorCode\n  message\n  startedAt\n  endedAt\n}\n"
  }
};
})();

(node as any).hash = "9862707b467c868b08d3b9daed48f333";

export default node;
