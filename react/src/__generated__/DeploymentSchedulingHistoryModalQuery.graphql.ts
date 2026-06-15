/**
 * @generated SignedSource<<c587f9e1882663e663a5d0e7f2aca1f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentHistoryOrderField = "CREATED_AT" | "UPDATED_AT" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type SchedulingResult = "EXPIRED" | "FAILURE" | "GIVE_UP" | "NEED_RETRY" | "SKIPPED" | "STALE" | "SUCCESS" | "%future added value";
export type DeploymentScope = {
  deploymentId: string;
};
export type DeploymentHistoryFilter = {
  AND?: ReadonlyArray<DeploymentHistoryFilter> | null | undefined;
  NOT?: ReadonlyArray<DeploymentHistoryFilter> | null | undefined;
  OR?: ReadonlyArray<DeploymentHistoryFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  deploymentId?: UUIDFilter | null | undefined;
  errorCode?: StringFilter | null | undefined;
  fromStatus?: ReadonlyArray<string> | null | undefined;
  id?: UUIDFilter | null | undefined;
  message?: StringFilter | null | undefined;
  phase?: StringFilter | null | undefined;
  result?: SchedulingResultFilter | null | undefined;
  toStatus?: ReadonlyArray<string> | null | undefined;
  updatedAt?: DateTimeFilter | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type SchedulingResultFilter = {
  equals?: SchedulingResult | null | undefined;
  in?: ReadonlyArray<SchedulingResult> | null | undefined;
  notEquals?: SchedulingResult | null | undefined;
  notIn?: ReadonlyArray<SchedulingResult> | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type DeploymentHistoryOrderBy = {
  direction?: OrderDirection;
  field: DeploymentHistoryOrderField;
};
export type DeploymentSchedulingHistoryModalQuery$variables = {
  filter?: DeploymentHistoryFilter | null | undefined;
  orderBy?: ReadonlyArray<DeploymentHistoryOrderBy> | null | undefined;
  scope: DeploymentScope;
};
export type DeploymentSchedulingHistoryModalQuery$data = {
  readonly deploymentScopedSchedulingHistories: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentSchedulingHistoryTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type DeploymentSchedulingHistoryModalQuery = {
  response: DeploymentSchedulingHistoryModalQuery$data;
  variables: DeploymentSchedulingHistoryModalQuery$variables;
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
  "name": "orderBy"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v3 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "errorCode",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "message",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DeploymentHistoryConnection",
        "kind": "LinkedField",
        "name": "deploymentScopedSchedulingHistories",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentHistory",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIDeploymentSchedulingHistoryTableFragment"
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentSchedulingHistoryModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "DeploymentHistoryConnection",
        "kind": "LinkedField",
        "name": "deploymentScopedSchedulingHistories",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentHistoryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentHistory",
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
                  (v4/*: any*/),
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
                      (v4/*: any*/),
                      (v5/*: any*/),
                      (v6/*: any*/),
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
                    "name": "category",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "phase",
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
                  (v5/*: any*/),
                  (v6/*: any*/),
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
    "cacheID": "d5545baf9254238711d930e4388936dd",
    "id": null,
    "metadata": {},
    "name": "DeploymentSchedulingHistoryModalQuery",
    "operationKind": "query",
    "text": "query DeploymentSchedulingHistoryModalQuery(\n  $scope: DeploymentScope!\n  $filter: DeploymentHistoryFilter\n  $orderBy: [DeploymentHistoryOrderBy!]\n) {\n  deploymentScopedSchedulingHistories(scope: $scope, filter: $filter, orderBy: $orderBy) {\n    edges {\n      node {\n        ...BAIDeploymentSchedulingHistoryTableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIDeploymentSchedulingHistoryNodesFragment on DeploymentHistory {\n  id\n  category\n  phase\n  fromStatus\n  toStatus\n  result\n  errorCode\n  message\n  attempts\n  createdAt\n  updatedAt\n}\n\nfragment BAIDeploymentSchedulingHistoryTableFragment on DeploymentHistory {\n  id\n  result\n  subSteps {\n    ...BAISubStepNodesFragment\n  }\n  ...BAIDeploymentSchedulingHistoryNodesFragment\n}\n\nfragment BAISubStepNodesFragment on SubStepResultGQL {\n  step\n  result\n  errorCode\n  message\n  startedAt\n  endedAt\n}\n"
  }
};
})();

(node as any).hash = "85600df901d6fbaa9bbc3ac84ede6d06";

export default node;
