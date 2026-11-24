/**
 * @generated SignedSource<<b02f724b25c9719420873a930e8f3467>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type AppConfigFragmentFilter = {
  AND?: ReadonlyArray<AppConfigFragmentFilter> | null | undefined;
  NOT?: ReadonlyArray<AppConfigFragmentFilter> | null | undefined;
  OR?: ReadonlyArray<AppConfigFragmentFilter> | null | undefined;
  configName?: StringFilter | null | undefined;
  createdAt?: DateTimeFilter | null | undefined;
  entityId?: UUIDFilter | null | undefined;
  scopeType?: AppConfigFragmentScopeTypeFilter | null | undefined;
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
export type AppConfigFragmentScopeTypeFilter = {
  equals?: AppConfigScopeType | null | undefined;
  in?: ReadonlyArray<AppConfigScopeType> | null | undefined;
  notEquals?: AppConfigScopeType | null | undefined;
  notIn?: ReadonlyArray<AppConfigScopeType> | null | undefined;
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
export type AppConfigFixtureDiagnosticsSectionPurgeImpactQuery$variables = {
  filter: AppConfigFragmentFilter;
};
export type AppConfigFixtureDiagnosticsSectionPurgeImpactQuery$data = {
  readonly adminAppConfigFragments: {
    readonly count: number;
  } | null | undefined;
};
export type AppConfigFixtureDiagnosticsSectionPurgeImpactQuery = {
  response: AppConfigFixtureDiagnosticsSectionPurgeImpactQuery$data;
  variables: AppConfigFixtureDiagnosticsSectionPurgeImpactQuery$variables;
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
    "alias": null,
    "args": [
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
        "name": "offset",
        "value": 0
      }
    ],
    "concreteType": "AppConfigFragmentConnection",
    "kind": "LinkedField",
    "name": "adminAppConfigFragments",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AppConfigFixtureDiagnosticsSectionPurgeImpactQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionPurgeImpactQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "013662d96955ebcd76aa8287cf0ab5d1",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionPurgeImpactQuery",
    "operationKind": "query",
    "text": "query AppConfigFixtureDiagnosticsSectionPurgeImpactQuery(\n  $filter: AppConfigFragmentFilter!\n) {\n  adminAppConfigFragments(filter: $filter, limit: 1, offset: 0) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "c51a37633e505c336b45f750a18d28e1";

export default node;
