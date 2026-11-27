/**
 * @generated SignedSource<<fe8bec860a2c68e549ff97362f909aaf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type SessionScope = {
  sessionId: string;
};
export type PendingSessionsPanelReasonQuery$variables = {
  scope: SessionScope;
};
export type PendingSessionsPanelReasonQuery$data = {
  readonly sessionScopedSchedulingHistories: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly errorCode: string | null | undefined;
        readonly message: string | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
};
export type PendingSessionsPanelReasonQuery = {
  response: PendingSessionsPanelReasonQuery$data;
  variables: PendingSessionsPanelReasonQuery$variables;
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
    "name": "filter",
    "value": {
      "result": {
        "notEquals": "SUCCESS"
      }
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
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
  "name": "message",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "errorCode",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PendingSessionsPanelReasonQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
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
                    (v2/*: any*/),
                    (v3/*: any*/)
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
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PendingSessionsPanelReasonQuery",
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
                  (v2/*: any*/),
                  (v3/*: any*/),
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
      }
    ]
  },
  "params": {
    "cacheID": "75212c84a34ecb4e5ba1d3485d1384f7",
    "id": null,
    "metadata": {},
    "name": "PendingSessionsPanelReasonQuery",
    "operationKind": "query",
    "text": "query PendingSessionsPanelReasonQuery(\n  $scope: SessionScope!\n) {\n  sessionScopedSchedulingHistories(scope: $scope, filter: {result: {notEquals: SUCCESS}}, orderBy: [{field: UPDATED_AT, direction: DESC}], limit: 1) {\n    edges {\n      node {\n        message\n        errorCode\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8f2b816e358c9a5ca355a96bf75b2d5a";

export default node;
