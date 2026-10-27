/**
 * @generated SignedSource<<626b8ce8ab9cc2d7a18b9d5ac704faef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectModelCardV2Scope = {
  projectId: string;
};
export type ModelCardV2Filter = {
  AND?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  OR?: ReadonlyArray<ModelCardV2Filter> | null | undefined;
  accessLevel?: StringFilter | null | undefined;
  architecture?: StringFilter | null | undefined;
  author?: StringFilter | null | undefined;
  category?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  creatorId?: UUIDFilter | null | undefined;
  domainName?: StringFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  license?: StringFilter | null | undefined;
  minResource?: ModelCardV2ResourceRequirementNestedFilter | null | undefined;
  modelVersion?: StringFilter | null | undefined;
  name?: StringFilter | null | undefined;
  projectId?: UUIDFilter | null | undefined;
  storageHost?: StringFilter | null | undefined;
  task?: StringFilter | null | undefined;
  title?: StringFilter | null | undefined;
  updatedAt?: NullableDateTimeFilter | null | undefined;
  vfolderId?: UUIDFilter | null | undefined;
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
export type ModelCardV2ResourceRequirementNestedFilter = {
  every?: ModelCardV2ResourceRequirementFilter | null | undefined;
  exists?: boolean | null | undefined;
  none?: ModelCardV2ResourceRequirementFilter | null | undefined;
  some?: ModelCardV2ResourceRequirementFilter | null | undefined;
};
export type ModelCardV2ResourceRequirementFilter = {
  minQuantity?: DecimalFilter | null | undefined;
  slotName?: StringFilter | null | undefined;
};
export type DecimalFilter = {
  equals?: any | null | undefined;
  greaterThan?: any | null | undefined;
  greaterThanOrEqual?: any | null | undefined;
  lessThan?: any | null | undefined;
  lessThanOrEqual?: any | null | undefined;
  notEquals?: any | null | undefined;
};
export type ModelCardSelectQuery$variables = {
  filter?: ModelCardV2Filter | null | undefined;
  limit: number;
  offset: number;
  scope: ProjectModelCardV2Scope;
};
export type ModelCardSelectQuery$data = {
  readonly projectModelCardsV2: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly availablePresets: {
          readonly count: number;
        } | null | undefined;
        readonly id: string;
        readonly metadata: {
          readonly title: string | null | undefined;
        };
        readonly name: string;
        readonly vfolderId: string;
      };
    }>;
  } | null | undefined;
};
export type ModelCardSelectQuery = {
  response: ModelCardSelectQuery$data;
  variables: ModelCardSelectQuery$variables;
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
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v5 = [
  {
    "alias": null,
    "args": [
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
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "DESC",
            "field": "CREATED_AT"
          }
        ]
      },
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "ModelCardV2Connection",
    "kind": "LinkedField",
    "name": "projectModelCardsV2",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelCardV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelCardV2",
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
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "vfolderId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelCardV2Metadata",
                "kind": "LinkedField",
                "name": "metadata",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "orderBy",
                    "value": [
                      {
                        "direction": "ASC",
                        "field": "RANK"
                      }
                    ]
                  }
                ],
                "concreteType": "DeploymentRevisionPresetConnection",
                "kind": "LinkedField",
                "name": "availablePresets",
                "plural": false,
                "selections": [
                  (v4/*: any*/)
                ],
                "storageKey": "availablePresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
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
];
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
    "name": "ModelCardSelectQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "ModelCardSelectQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "0936960d48e141acf4d47c6b46e1db49",
    "id": null,
    "metadata": {},
    "name": "ModelCardSelectQuery",
    "operationKind": "query",
    "text": "query ModelCardSelectQuery(\n  $scope: ProjectModelCardV2Scope!\n  $filter: ModelCardV2Filter\n  $limit: Int!\n  $offset: Int!\n) {\n  projectModelCardsV2(scope: $scope, filter: $filter, orderBy: [{field: CREATED_AT, direction: \"DESC\"}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        name\n        vfolderId\n        metadata {\n          title\n        }\n        availablePresets(orderBy: [{field: RANK, direction: \"ASC\"}]) {\n          count\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a9c11d2888d65e5a6fcb22aed92f3330";

export default node;
