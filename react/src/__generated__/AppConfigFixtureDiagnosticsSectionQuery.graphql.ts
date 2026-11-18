/**
 * @generated SignedSource<<3136b69f10fe6dc79f76267a1965c50f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type AppConfigDefinitionFilter = {
  AND?: ReadonlyArray<AppConfigDefinitionFilter> | null | undefined;
  NOT?: ReadonlyArray<AppConfigDefinitionFilter> | null | undefined;
  OR?: ReadonlyArray<AppConfigDefinitionFilter> | null | undefined;
  configName?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  updatedAt?: DateTimeFilter | null | undefined;
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
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type AppConfigAllowListFilter = {
  AND?: ReadonlyArray<AppConfigAllowListFilter> | null | undefined;
  NOT?: ReadonlyArray<AppConfigAllowListFilter> | null | undefined;
  OR?: ReadonlyArray<AppConfigAllowListFilter> | null | undefined;
  configName?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  scopeType?: AppConfigScopeTypeFilter | null | undefined;
  updatedAt?: DateTimeFilter | null | undefined;
};
export type AppConfigScopeTypeFilter = {
  equals?: AppConfigScopeType | null | undefined;
  in?: ReadonlyArray<AppConfigScopeType> | null | undefined;
  notEquals?: AppConfigScopeType | null | undefined;
  notIn?: ReadonlyArray<AppConfigScopeType> | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionQuery$variables = {
  allowListFilter?: AppConfigAllowListFilter | null | undefined;
  definitionFilter?: AppConfigDefinitionFilter | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionQuery$data = {
  readonly adminAppConfigAllowLists: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly configName: string;
        readonly entityId: string;
        readonly id: string;
        readonly rank: number;
        readonly scopeType: AppConfigScopeType;
      };
    }>;
  } | null | undefined;
  readonly adminAppConfigDefinitions: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly configName: string;
        readonly entityId: string;
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionQuery = {
  response: AppConfigFixtureDiagnosticsSectionQuery$data;
  variables: AppConfigFixtureDiagnosticsSectionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowListFilter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "definitionFilter"
},
v2 = {
  "kind": "Literal",
  "name": "limit",
  "value": 100
},
v3 = {
  "kind": "Literal",
  "name": "offset",
  "value": 0
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "configName",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "definitionFilter"
      },
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "concreteType": "AppConfigDefinitionConnection",
    "kind": "LinkedField",
    "name": "adminAppConfigDefinitions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigDefinitionEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AppConfigDefinition",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "allowListFilter"
      },
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "concreteType": "AppConfigAllowListConnection",
    "kind": "LinkedField",
    "name": "adminAppConfigAllowLists",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfigAllowListEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AppConfigAllowList",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "scopeType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rank",
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "e72e2ce55890d2ef37ae11cb240b0d4c",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "operationKind": "query",
    "text": "query AppConfigFixtureDiagnosticsSectionQuery(\n  $definitionFilter: AppConfigDefinitionFilter\n  $allowListFilter: AppConfigAllowListFilter\n) {\n  adminAppConfigDefinitions(filter: $definitionFilter, limit: 100, offset: 0) {\n    edges {\n      node {\n        id\n        entityId\n        configName\n      }\n    }\n  }\n  adminAppConfigAllowLists(filter: $allowListFilter, limit: 100, offset: 0) {\n    edges {\n      node {\n        id\n        entityId\n        configName\n        scopeType\n        rank\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3011078351d9f5ec13b579b4f70ee50e";

export default node;
