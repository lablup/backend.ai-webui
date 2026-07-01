/**
 * @generated SignedSource<<c3c65e653e35f168ed3ced3cc5cffb7b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AutoScalingRuleOrderField = "CREATED_AT" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type AutoScalingRuleOrderBy = {
  direction?: OrderDirection;
  field: AutoScalingRuleOrderField;
};
export type AutoScalingRuleFilter = {
  AND?: ReadonlyArray<AutoScalingRuleFilter> | null | undefined;
  NOT?: ReadonlyArray<AutoScalingRuleFilter> | null | undefined;
  OR?: ReadonlyArray<AutoScalingRuleFilter> | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  lastTriggeredAt?: NullableDateTimeFilter | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type NullableDateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  isNull?: boolean | null | undefined;
  notEquals?: string | null | undefined;
};
export type DeploymentAutoScalingCardListQuery$variables = {
  deploymentId: string;
  filter?: AutoScalingRuleFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<AutoScalingRuleOrderBy> | null | undefined;
};
export type DeploymentAutoScalingCardListQuery$data = {
  readonly deployment: {
    readonly autoScalingRules: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly metricName: string;
          readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleEditorModalFragment" | "AutoScalingRuleListNodesFragment">;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentAutoScalingCardListQuery = {
  response: DeploymentAutoScalingCardListQuery$data;
  variables: DeploymentAutoScalingCardListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deploymentId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metricName",
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
    "name": "DeploymentAutoScalingCardListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "AutoScalingRuleConnection",
            "kind": "LinkedField",
            "name": "autoScalingRules",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "AutoScalingRuleEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "AutoScalingRule",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "AutoScalingRuleListNodesFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "AutoScalingRuleEditorModalFragment"
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentAutoScalingCardListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "AutoScalingRuleConnection",
            "kind": "LinkedField",
            "name": "autoScalingRules",
            "plural": false,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "AutoScalingRuleEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "AutoScalingRule",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "metricSource",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "minThreshold",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "maxThreshold",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "stepSize",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "timeWindow",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "minReplicas",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "maxReplicas",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "prometheusQueryPresetId",
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
                        "name": "lastTriggeredAt",
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
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "41c9b35cb41550bd8f8cde32c8b21c1a",
    "id": null,
    "metadata": {},
    "name": "DeploymentAutoScalingCardListQuery",
    "operationKind": "query",
    "text": "query DeploymentAutoScalingCardListQuery(\n  $deploymentId: ID!\n  $offset: Int\n  $limit: Int\n  $orderBy: [AutoScalingRuleOrderBy!]\n  $filter: AutoScalingRuleFilter\n) {\n  deployment(id: $deploymentId) {\n    autoScalingRules(offset: $offset, limit: $limit, orderBy: $orderBy, filter: $filter) {\n      count\n      edges {\n        node {\n          id\n          metricName\n          ...AutoScalingRuleListNodesFragment\n          ...AutoScalingRuleEditorModalFragment\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment AutoScalingRuleEditorModalFragment on AutoScalingRule {\n  id\n  metricSource\n  metricName\n  minThreshold\n  maxThreshold\n  stepSize\n  timeWindow\n  minReplicas\n  maxReplicas\n  prometheusQueryPresetId\n}\n\nfragment AutoScalingRuleListNodesFragment on AutoScalingRule {\n  id\n  metricSource\n  metricName\n  minThreshold\n  maxThreshold\n  stepSize\n  timeWindow\n  minReplicas\n  maxReplicas\n  prometheusQueryPresetId\n  createdAt\n  lastTriggeredAt\n  ...AutoScalingRuleEditorModalFragment\n}\n"
  }
};
})();

(node as any).hash = "56b6637e50dbda972f85edac73bc04b5";

export default node;
