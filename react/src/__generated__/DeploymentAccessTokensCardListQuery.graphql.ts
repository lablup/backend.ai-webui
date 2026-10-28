/**
 * @generated SignedSource<<93237c97f6ca9b60c8d29224a33cfe1f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAccessTokensCardListQuery$variables = {
  deploymentId: string;
  limit: number;
  offset: number;
};
export type DeploymentAccessTokensCardListQuery$data = {
  readonly deployment: {
    readonly accessTokens: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly createdAt: string;
          readonly expiresAt: string | null | undefined;
          readonly fieldId: string;
          readonly id: string;
          readonly token: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type DeploymentAccessTokensCardListQuery = {
  response: DeploymentAccessTokensCardListQuery$data;
  variables: DeploymentAccessTokensCardListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
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
    }
  ],
  "concreteType": "AccessTokenConnection",
  "kind": "LinkedField",
  "name": "accessTokens",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "AccessTokenEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "AccessToken",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "fieldId",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "token",
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
              "name": "expiresAt",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAccessTokensCardListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v3/*: any*/)
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
    "name": "DeploymentAccessTokensCardListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "15f3315917487cbbd54f068245d9ccf8",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensCardListQuery",
    "operationKind": "query",
    "text": "query DeploymentAccessTokensCardListQuery(\n  $deploymentId: ID!\n  $limit: Int!\n  $offset: Int!\n) {\n  deployment(id: $deploymentId) {\n    accessTokens(orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit, offset: $offset) {\n      count\n      edges {\n        node {\n          id\n          fieldId\n          token\n          createdAt\n          expiresAt\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ffa46a3aaf32dad81fc49a9e4a97830b";

export default node;
