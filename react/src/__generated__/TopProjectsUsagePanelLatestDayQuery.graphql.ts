/**
 * @generated SignedSource<<ebe894c0a1aee869a8482bc60d6a8166>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectUsageBucketFilter = {
  AND?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  NOT?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  OR?: ReadonlyArray<ProjectUsageBucketFilter> | null | undefined;
  domainName?: StringFilter | null | undefined;
  fieldId?: UUIDFilter | null | undefined;
  periodEnd?: DateFilter | null | undefined;
  periodStart?: DateFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  resourceGroup?: StringFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type DateFilter = {
  after?: any | null | undefined;
  before?: any | null | undefined;
  equals?: any | null | undefined;
  notEquals?: any | null | undefined;
};
export type TopProjectsUsagePanelLatestDayQuery$variables = {
  filter: ProjectUsageBucketFilter;
};
export type TopProjectsUsagePanelLatestDayQuery$data = {
  readonly latest: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly metadata: {
          readonly periodStart: any;
        };
      };
    }>;
  } | null | undefined;
};
export type TopProjectsUsagePanelLatestDayQuery = {
  response: TopProjectsUsagePanelLatestDayQuery$data;
  variables: TopProjectsUsagePanelLatestDayQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
        "field": "PERIOD_START"
      }
    ]
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "UsageBucketMetadata",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "periodStart",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TopProjectsUsagePanelLatestDayQuery",
    "selections": [
      {
        "alias": "latest",
        "args": (v1/*: any*/),
        "concreteType": "ProjectUsageBucketConnection",
        "kind": "LinkedField",
        "name": "adminProjectUsageBuckets",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectUsageBucketEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectUsageBucket",
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
    "name": "TopProjectsUsagePanelLatestDayQuery",
    "selections": [
      {
        "alias": "latest",
        "args": (v1/*: any*/),
        "concreteType": "ProjectUsageBucketConnection",
        "kind": "LinkedField",
        "name": "adminProjectUsageBuckets",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectUsageBucketEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectUsageBucket",
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
    "cacheID": "0b2eb0fd4a3a58dbe350e8b50465813a",
    "id": null,
    "metadata": {},
    "name": "TopProjectsUsagePanelLatestDayQuery",
    "operationKind": "query",
    "text": "query TopProjectsUsagePanelLatestDayQuery(\n  $filter: ProjectUsageBucketFilter!\n) {\n  latest: adminProjectUsageBuckets(filter: $filter, orderBy: [{field: PERIOD_START, direction: DESC}], limit: 1) {\n    edges {\n      node {\n        metadata {\n          periodStart\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2e9d0aa6a16b8fde5b86b8663cf46f6a";

export default node;
