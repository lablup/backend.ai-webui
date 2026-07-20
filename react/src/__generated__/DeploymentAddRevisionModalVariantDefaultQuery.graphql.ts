/**
 * @generated SignedSource<<8508e0d30e118be1babd0c2b101d2142>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAddRevisionModalVariantDefaultQuery$variables = {
  id: string;
  skip: boolean;
};
export type DeploymentAddRevisionModalVariantDefaultQuery$data = {
  readonly runtimeVariant?: {
    readonly defaultModelDefinition: {
      readonly models: ReadonlyArray<{
        readonly modelPath: string | null | undefined;
        readonly name: string | null | undefined;
        readonly service: {
          readonly command: string | null | undefined;
          readonly healthCheck: {
            readonly expectedStatusCode: number | null | undefined;
            readonly initialDelay: number | null | undefined;
            readonly interval: number | null | undefined;
            readonly maxRetries: number | null | undefined;
            readonly maxWaitTime: number | null | undefined;
            readonly path: string | null | undefined;
          } | null | undefined;
          readonly port: number | null | undefined;
          readonly shell: string | null | undefined;
        } | null | undefined;
      }> | null | undefined;
    };
    readonly id: string;
  } | null | undefined;
};
export type DeploymentAddRevisionModalVariantDefaultQuery = {
  response: DeploymentAddRevisionModalVariantDefaultQuery$data;
  variables: DeploymentAddRevisionModalVariantDefaultQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "id"
          }
        ],
        "concreteType": "RuntimeVariant",
        "kind": "LinkedField",
        "name": "runtimeVariant",
        "plural": false,
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
            "concreteType": "RuntimeVariantModelDefinition",
            "kind": "LinkedField",
            "name": "defaultModelDefinition",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariantModelConfig",
                "kind": "LinkedField",
                "name": "models",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "modelPath",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariantModelServiceConfig",
                    "kind": "LinkedField",
                    "name": "service",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "command",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "shell",
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
                        "concreteType": "RuntimeVariantModelHealthCheck",
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
                            "name": "interval",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "maxRetries",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "maxWaitTime",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "expectedStatusCode",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "initialDelay",
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
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalVariantDefaultQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAddRevisionModalVariantDefaultQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b982e031fe7b1ad29f2aa13dcfbaf1d8",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalVariantDefaultQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalVariantDefaultQuery(\n  $id: UUID!\n  $skip: Boolean!\n) {\n  runtimeVariant(id: $id) @skip(if: $skip) {\n    id\n    defaultModelDefinition @since(version: \"26.8.0\") {\n      models {\n        name\n        modelPath\n        service {\n          command\n          shell\n          port\n          healthCheck {\n            path\n            interval\n            maxRetries\n            maxWaitTime\n            expectedStatusCode\n            initialDelay\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d801edfc0a79e2ccabc5d40a37fa110";

export default node;
