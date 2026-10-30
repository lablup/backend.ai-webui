/**
 * @generated SignedSource<<ea488334eb263514a7711d2238d5c077>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type PendingSessionsPanelReasonQuery$variables = {
  filter: string;
  first: number;
  scopeId: any;
  skip: boolean;
};
export type PendingSessionsPanelReasonQuery$data = {
  readonly compute_session_nodes?: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly row_id: string | null | undefined;
        readonly status_data: string | null | undefined;
        readonly status_info: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined, unknown>;
};
export type PendingSessionsPanelReasonQuery = {
  response: PendingSessionsPanelReasonQuery$data;
  variables: PendingSessionsPanelReasonQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "scopeId"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_data",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PendingSessionsPanelReasonQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "alias": null,
              "args": (v4/*: any*/),
              "concreteType": "ComputeSessionConnection",
              "kind": "LinkedField",
              "name": "compute_session_nodes",
              "plural": false,
              "selections": [
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
                        (v5/*: any*/),
                        (v6/*: any*/),
                        (v7/*: any*/)
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
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "PendingSessionsPanelReasonQuery",
    "selections": [
      {
        "condition": "skip",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ComputeSessionConnection",
            "kind": "LinkedField",
            "name": "compute_session_nodes",
            "plural": false,
            "selections": [
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
                      (v5/*: any*/),
                      (v6/*: any*/),
                      (v7/*: any*/),
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
      }
    ]
  },
  "params": {
    "cacheID": "8ee241d27178474ab3fd3c4fe562057b",
    "id": null,
    "metadata": {},
    "name": "PendingSessionsPanelReasonQuery",
    "operationKind": "query",
    "text": "query PendingSessionsPanelReasonQuery(\n  $scopeId: ScopeField!\n  $filter: String!\n  $first: Int!\n  $skip: Boolean!\n) {\n  compute_session_nodes(scope_id: $scopeId, filter: $filter, first: $first) @skip(if: $skip) {\n    edges {\n      node {\n        row_id\n        status_info\n        status_data\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "87d450d91d070233597f8b853892e447";

export default node;
