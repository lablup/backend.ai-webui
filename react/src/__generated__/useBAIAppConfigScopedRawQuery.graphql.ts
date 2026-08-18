/**
 * @generated SignedSource<<941391384229b1b11b8e92a5066b69cb>>
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
export type useBAIAppConfigScopedRawQuery$variables = {
  configNames: ReadonlyArray<string>;
  scope: AppConfigScopeRef;
};
export type useBAIAppConfigScopedRawQuery$data = {
  readonly scopedAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useBAIAppConfigScopedRawQuery = {
  response: useBAIAppConfigScopedRawQuery$data;
  variables: useBAIAppConfigScopedRawQuery$variables;
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
    "name": "useBAIAppConfigScopedRawQuery",
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
    "name": "useBAIAppConfigScopedRawQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "a284d11d83f1a9533b89a84ed7a28f3e",
    "id": null,
    "metadata": {},
    "name": "useBAIAppConfigScopedRawQuery",
    "operationKind": "query",
    "text": "query useBAIAppConfigScopedRawQuery(\n  $scope: AppConfigScopeRef!\n  $configNames: [String!]!\n) {\n  scopedAppConfigFragmentsByNames(scope: $scope, configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "289a005e1cbd0613bb7965b018c616c7";

export default node;
