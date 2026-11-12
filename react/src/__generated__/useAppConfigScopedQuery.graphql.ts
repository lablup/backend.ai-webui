/**
 * @generated SignedSource<<14ec2f16d37ed53d2892b82a40f8b488>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type AppConfigScopeRef = {
  scopeId?: string | null | undefined;
  scopeType: AppConfigScopeType;
};
export type useAppConfigScopedQuery$variables = {
  configNames: ReadonlyArray<string>;
  scope: AppConfigScopeRef;
};
export type useAppConfigScopedQuery$data = {
  readonly scopedAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useAppConfigScopedQuery = {
  response: useAppConfigScopedQuery$data;
  variables: useAppConfigScopedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "configNames"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "configNames",
        "variableName": "configNames"
      },
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "scope"
      }
    ],
    "concreteType": "AppConfigFragment",
    "kind": "LinkedField",
    "name": "scopedAppConfigFragmentsByNames",
    "plural": true,
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
        "name": "configName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "config",
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
    "name": "useAppConfigScopedQuery",
    "selections": (v2/*: any*/),
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
    "name": "useAppConfigScopedQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "8df627dc07cf71c155c9574a29909539",
    "id": null,
    "metadata": {},
    "name": "useAppConfigScopedQuery",
    "operationKind": "query",
    "text": "query useAppConfigScopedQuery(\n  $scope: AppConfigScopeRef!\n  $configNames: [String!]!\n) {\n  scopedAppConfigFragmentsByNames(scope: $scope, configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "424ad6669b7b8634f23be1e99a6f39b0";

export default node;
