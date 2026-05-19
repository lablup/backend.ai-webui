/**
 * @generated SignedSource<<23cf171a80e8404b7b4beb893867abdd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ServiceLauncherPageContent_ModelDefinitionQuery$variables = {
  deploymentId: string;
};
export type ServiceLauncherPageContent_ModelDefinitionQuery$data = {
  readonly deployment: {
    readonly revisionHistory: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly modelDefinition: {
            readonly models: ReadonlyArray<{
              readonly service: {
                readonly healthCheck: {
                  readonly initialDelay: number;
                  readonly maxRetries: number;
                  readonly path: string;
                } | null | undefined;
                readonly port: number;
                readonly startCommand: ReadonlyArray<string> | null | undefined;
              } | null | undefined;
            }>;
          } | null | undefined;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type ServiceLauncherPageContent_ModelDefinitionQuery = {
  response: ServiceLauncherPageContent_ModelDefinitionQuery$data;
  variables: ServiceLauncherPageContent_ModelDefinitionQuery$variables;
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
v2 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
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
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelDefinition",
  "kind": "LinkedField",
  "name": "modelDefinition",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelConfig",
      "kind": "LinkedField",
      "name": "models",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModelServiceConfig",
          "kind": "LinkedField",
          "name": "service",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "startCommand",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "port",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelHealthCheck",
              "kind": "LinkedField",
              "name": "healthCheck",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "path",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "initialDelay",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "maxRetries",
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
  ],
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ServiceLauncherPageContent_ModelDefinitionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisionHistory(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}])"
          }
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
    "name": "ServiceLauncherPageContent_ModelDefinitionQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "ModelRevisionConnection",
            "kind": "LinkedField",
            "name": "revisionHistory",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelRevisionEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ModelRevision",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisionHistory(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}])"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "629bcb60f35a33e4d76cfb4b7d6c16fe",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageContent_ModelDefinitionQuery",
    "operationKind": "query",
    "text": "query ServiceLauncherPageContent_ModelDefinitionQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    revisionHistory(limit: 1, orderBy: [{field: CREATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          modelDefinition {\n            models {\n              service {\n                startCommand\n                port\n                healthCheck {\n                  path\n                  initialDelay\n                  maxRetries\n                }\n              }\n            }\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "85014b48007ac8528b87ff758ced0109";

export default node;
