/**
 * @generated SignedSource<<b0525c4d71a8c4df4d253016febb9402>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type EndpointTokenSelectQuery$variables = {
  deploymentId: string;
};
export type EndpointTokenSelectQuery$data = {
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
export type EndpointTokenSelectQuery = {
  response: EndpointTokenSelectQuery$data;
  variables: EndpointTokenSelectQuery$variables;
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
    "name": "EndpointTokenSelectQuery",
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
    "name": "EndpointTokenSelectQuery",
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
    "cacheID": "804f425e87909bf310afc6b08603997f",
    "id": null,
    "metadata": {},
    "name": "EndpointTokenSelectQuery",
    "operationKind": "query",
    "text": "query EndpointTokenSelectQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    accessTokens(orderBy: [{field: CREATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          id\n          token\n          createdAt\n          expiresAt\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "510ee4474805d8ecefee557eab25da84";

export default node;
