/**
 * @generated SignedSource<<eda0d0b2f530c2a8770327ed6b8da70e>>
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
  domainNames: ReadonlyArray<string>;
  domainScope: AppConfigScopeRef;
  publicNames: ReadonlyArray<string>;
  publicScope: AppConfigScopeRef;
  skipDomain: boolean;
  skipPublic: boolean;
  skipUser: boolean;
  userNames: ReadonlyArray<string>;
  userScope: AppConfigScopeRef;
};
export type useAppConfigScopedQuery$data = {
  readonly domain?: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined> | null | undefined;
  readonly public?: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined> | null | undefined;
  readonly user?: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined> | null | undefined;
};
export type useAppConfigScopedQuery = {
  response: useAppConfigScopedQuery$data;
  variables: useAppConfigScopedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainNames"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainScope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "publicNames"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "publicScope"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipDomain"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipPublic"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipUser"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userNames"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userScope"
},
v9 = [
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
v10 = {
  "alias": "public",
  "args": [
    {
      "kind": "Variable",
      "name": "configNames",
      "variableName": "publicNames"
    },
    {
      "kind": "Variable",
      "name": "scope",
      "variableName": "publicScope"
    }
  ],
  "concreteType": "AppConfigFragment",
  "kind": "LinkedField",
  "name": "scopedAppConfigFragmentsByNames",
  "plural": true,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v11 = {
  "alias": "domain",
  "args": [
    {
      "kind": "Variable",
      "name": "configNames",
      "variableName": "domainNames"
    },
    {
      "kind": "Variable",
      "name": "scope",
      "variableName": "domainScope"
    }
  ],
  "concreteType": "AppConfigFragment",
  "kind": "LinkedField",
  "name": "scopedAppConfigFragmentsByNames",
  "plural": true,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v12 = {
  "alias": "user",
  "args": [
    {
      "kind": "Variable",
      "name": "configNames",
      "variableName": "userNames"
    },
    {
      "kind": "Variable",
      "name": "scope",
      "variableName": "userScope"
    }
  ],
  "concreteType": "AppConfigFragment",
  "kind": "LinkedField",
  "name": "scopedAppConfigFragmentsByNames",
  "plural": true,
  "selections": (v9/*: any*/),
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useAppConfigScopedQuery",
    "selections": [
      {
        "condition": "skipPublic",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v10/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v11/*: any*/),
            "to": "NULL"
          }
        ]
      },
      {
        "condition": "skipUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": (v12/*: any*/),
            "to": "NULL"
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
      (v3/*: any*/),
      (v2/*: any*/),
      (v5/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v8/*: any*/),
      (v7/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Operation",
    "name": "useAppConfigScopedQuery",
    "selections": [
      {
        "condition": "skipPublic",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          (v10/*: any*/)
        ]
      },
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          (v11/*: any*/)
        ]
      },
      {
        "condition": "skipUser",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          (v12/*: any*/)
        ]
      }
    ]
  },
  "params": {
    "cacheID": "034860da874ab85ebb22ddd44a526de5",
    "id": null,
    "metadata": {},
    "name": "useAppConfigScopedQuery",
    "operationKind": "query",
    "text": "query useAppConfigScopedQuery(\n  $publicScope: AppConfigScopeRef!\n  $publicNames: [String!]!\n  $skipPublic: Boolean!\n  $domainScope: AppConfigScopeRef!\n  $domainNames: [String!]!\n  $skipDomain: Boolean!\n  $userScope: AppConfigScopeRef!\n  $userNames: [String!]!\n  $skipUser: Boolean!\n) {\n  public: scopedAppConfigFragmentsByNames(scope: $publicScope, configNames: $publicNames) @skip(if: $skipPublic) {\n    id\n    configName\n    config\n  }\n  domain: scopedAppConfigFragmentsByNames(scope: $domainScope, configNames: $domainNames) @skip(if: $skipDomain) {\n    id\n    configName\n    config\n  }\n  user: scopedAppConfigFragmentsByNames(scope: $userScope, configNames: $userNames) @skip(if: $skipUser) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "570580fb6f7f96a25230e2e7d4814751";

export default node;
