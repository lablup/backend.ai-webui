/**
 * @generated SignedSource<<3c22d8657f2df27fc1101be4b5a35101>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ServiceLauncherPageQuery$variables = {
  deploymentId: string;
  endpointId: string;
};
export type ServiceLauncherPageQuery$data = {
  readonly endpoint: {
    readonly runtime_variant: {
      readonly name: string | null | undefined;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"ServiceLauncherPageContentFragment">;
  } | null | undefined;
  readonly modelDeployment: {
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
export type ServiceLauncherPageQuery = {
  response: ServiceLauncherPageQuery$data;
  variables: ServiceLauncherPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deploymentId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endpointId"
},
v2 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpointId"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v5 = [
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
v6 = {
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
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ServiceLauncherPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantInfo",
            "kind": "LinkedField",
            "name": "runtime_variant",
            "plural": false,
            "selections": [
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ServiceLauncherPageContentFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": "modelDeployment",
        "args": (v4/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
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
                      (v6/*: any*/)
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ServiceLauncherPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantInfo",
            "kind": "LinkedField",
            "name": "runtime_variant",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "human_readable_name",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endpoint_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "project",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "desired_session_count",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "replicas",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_group",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_slots",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "resource_opts",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cluster_mode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cluster_size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "open_to_public",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "model",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "model_mount_destination",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "model_definition_path",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "environ",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderNode",
            "kind": "LinkedField",
            "name": "extra_mounts",
            "plural": true,
            "selections": [
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "row_id",
                "storageKey": null
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageNode",
            "kind": "LinkedField",
            "name": "image_object",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "namespace",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "humanized_name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tag",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "registry",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "architecture",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "is_local",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "digest",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceLimit",
                "kind": "LinkedField",
                "name": "resource_limits",
                "plural": true,
                "selections": [
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "min",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "max",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "KVPair",
                "kind": "LinkedField",
                "name": "labels",
                "plural": true,
                "selections": [
                  (v8/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "value",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "size_bytes",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "supported_accelerators",
                "storageKey": null
              },
              (v7/*: any*/)
            ],
            "storageKey": null
          },
          (v3/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": "modelDeployment",
        "args": (v4/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v5/*: any*/),
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
                      (v6/*: any*/),
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "revisionHistory(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}])"
          },
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fc97f681421120d2c1c78ebea4bf0a42",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageQuery",
    "operationKind": "query",
    "text": "query ServiceLauncherPageQuery(\n  $endpointId: UUID!\n  $deploymentId: ID!\n) {\n  endpoint(endpoint_id: $endpointId) {\n    runtime_variant @since(version: \"24.03.5\") {\n      name\n    }\n    ...ServiceLauncherPageContentFragment\n    id\n  }\n  modelDeployment: deployment(id: $deploymentId) {\n    revisionHistory(limit: 1, orderBy: [{field: CREATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          modelDefinition {\n            models {\n              service {\n                startCommand\n                port\n                healthCheck {\n                  path\n                  initialDelay\n                  maxRetries\n                }\n              }\n            }\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment ServiceLauncherPageContentFragment on Endpoint {\n  endpoint_id\n  project\n  desired_session_count @deprecatedSince(version: \"24.12.0\")\n  replicas @since(version: \"24.12.0\")\n  resource_group\n  resource_slots\n  resource_opts\n  cluster_mode\n  cluster_size\n  open_to_public\n  model\n  model_mount_destination @since(version: \"24.03.4\")\n  model_definition_path @since(version: \"24.03.4\")\n  environ\n  runtime_variant @since(version: \"24.03.5\") {\n    name\n    human_readable_name\n  }\n  extra_mounts @since(version: \"24.03.4\") {\n    id\n    row_id\n    name\n  }\n  image_object @since(version: \"23.09.9\") {\n    name @deprecatedSince(version: \"24.12.0\")\n    namespace @since(version: \"24.12.0\")\n    humanized_name\n    tag\n    registry\n    architecture\n    is_local\n    digest\n    resource_limits {\n      key\n      min\n      max\n    }\n    labels {\n      key\n      value\n    }\n    size_bytes\n    supported_accelerators\n    id\n  }\n  name\n}\n"
  }
};
})();

(node as any).hash = "a9e2c2f77e358c4467f4749807f39da0";

export default node;
