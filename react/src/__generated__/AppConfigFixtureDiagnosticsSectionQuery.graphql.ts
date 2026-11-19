/**
 * @generated SignedSource<<945342f9a233894e5e925887ed963630>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AppConfigScopeType = "DOMAIN" | "PUBLIC" | "USER" | "%future added value";
export type AppConfigFixtureDiagnosticsSectionQuery$variables = Record<PropertyKey, never>;
export type AppConfigFixtureDiagnosticsSectionQuery$data = {
  readonly adminAppConfigAllowLists: {
    readonly count: number;
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
    readonly count: number;
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
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "configName",
  "storageKey": null
},
v5 = [
  {
    "alias": null,
    "args": (v0/*: any*/),
    "concreteType": "AppConfigDefinitionConnection",
    "kind": "LinkedField",
    "name": "adminAppConfigDefinitions",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "adminAppConfigDefinitions(limit:100,offset:0)"
  },
  {
    "alias": null,
    "args": (v0/*: any*/),
    "concreteType": "AppConfigAllowListConnection",
    "kind": "LinkedField",
    "name": "adminAppConfigAllowLists",
    "plural": false,
    "selections": [
      (v1/*: any*/),
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
              (v2/*: any*/),
              (v3/*: any*/),
              (v4/*: any*/),
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
    "storageKey": "adminAppConfigAllowLists(limit:100,offset:0)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "ea1249ce5e23d57a9342d0b3ef0ea243",
    "id": null,
    "metadata": {},
    "name": "AppConfigFixtureDiagnosticsSectionQuery",
    "operationKind": "query",
    "text": "query AppConfigFixtureDiagnosticsSectionQuery {\n  adminAppConfigDefinitions(limit: 100, offset: 0) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        configName\n      }\n    }\n  }\n  adminAppConfigAllowLists(limit: 100, offset: 0) {\n    count\n    edges {\n      node {\n        id\n        entityId\n        configName\n        scopeType\n        rank\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9425037f9d03c5b6f5e17625a4492b28";

export default node;
