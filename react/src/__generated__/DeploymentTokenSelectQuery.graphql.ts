/**
 * @generated SignedSource<<67a04953432bd9b61489a464abf3e172>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type DeploymentTokenSelectQuery$variables = {
  deploymentId: string;
};
export type DeploymentTokenSelectQuery$data = {
  readonly deployment: Result<{
    readonly accessTokens: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly createdAt: string;
          readonly expiresAt: string | null | undefined;
          readonly id: string;
          readonly token: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined, unknown>;
};
export type DeploymentTokenSelectQuery = {
  response: DeploymentTokenSelectQuery$data;
  variables: DeploymentTokenSelectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
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
  "storageKey": "accessTokens(orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}])"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentTokenSelectQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
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
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentTokenSelectQuery",
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
    "cacheID": "c83af70fa58b61c9daa4716e6a2a8049",
    "id": null,
    "metadata": {},
    "name": "DeploymentTokenSelectQuery",
    "operationKind": "query",
    "text": "query DeploymentTokenSelectQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    accessTokens(orderBy: [{field: CREATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          id\n          token\n          createdAt\n          expiresAt\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d5448e0f4b2191906c5ba30e7d998fdd";

export default node;
