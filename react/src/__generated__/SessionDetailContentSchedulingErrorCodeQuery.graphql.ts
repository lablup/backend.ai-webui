/**
 * @generated SignedSource<<6a6fdde1eab9af66164bb3d50751dbe4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionDetailContentSchedulingErrorCodeQuery$variables = {
  sessionId: string;
};
export type SessionDetailContentSchedulingErrorCodeQuery$data = {
  readonly sessionScopedSchedulingHistories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly errorCode: string | null | undefined;
      };
    }>;
  } | null | undefined;
};
export type SessionDetailContentSchedulingErrorCodeQuery = {
  response: SessionDetailContentSchedulingErrorCodeQuery$data;
  variables: SessionDetailContentSchedulingErrorCodeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "sessionId"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "first",
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
    "fields": [
      {
        "kind": "Variable",
        "name": "sessionId",
        "variableName": "sessionId"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v2 = {
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
    "name": "SessionDetailContentSchedulingErrorCodeQuery",
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
                  (v2/*: any*/)
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
    "name": "SessionDetailContentSchedulingErrorCodeQuery",
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
    "cacheID": "137a8291bf8b16d8b2dd6dbd2b68c82e",
    "id": null,
    "metadata": {},
    "name": "SessionDetailContentSchedulingErrorCodeQuery",
    "operationKind": "query",
    "text": "query SessionDetailContentSchedulingErrorCodeQuery(\n  $sessionId: UUID!\n) {\n  sessionScopedSchedulingHistories(scope: {sessionId: $sessionId}, orderBy: [{field: UPDATED_AT, direction: DESC}], first: 1) {\n    edges {\n      node {\n        errorCode\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "37d59ac50e38870610ae3776fa98e77c";

export default node;
