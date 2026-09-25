/**
 * @generated SignedSource<<de6e11d7ce7c6e690d66171cb421210b>>
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
  limit: number;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
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
  "storageKey": null
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
    "cacheID": "d2b32223fa166044a185a0f344133282",
    "id": null,
    "metadata": {},
    "name": "DeploymentTokenSelectQuery",
    "operationKind": "query",
    "text": "query DeploymentTokenSelectQuery(\n  $deploymentId: ID!\n  $limit: Int!\n) {\n  deployment(id: $deploymentId) {\n    accessTokens(orderBy: [{field: CREATED_AT, direction: DESC}], limit: $limit) {\n      edges {\n        node {\n          id\n          token\n          createdAt\n          expiresAt\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "806ecf6b0a241f933d1ee78855a6caa9";

export default node;
