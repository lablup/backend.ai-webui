/**
 * @generated SignedSource<<1e7a26950a6d59314b48743d80a8fd50>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AutoScalingMetricComparator = "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "%future added value";
export type AutoScalingMetricSource = "INFERENCE_FRAMEWORK" | "KERNEL" | "PROMETHEUS" | "%future added value";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type OrderDirection = "ASC" | "DESC" | "%future added value";
export type RouteHealthStatus = "DEGRADED" | "HEALTHY" | "NOT_CHECKED" | "UNHEALTHY" | "%future added value";
export type RouteOrderField = "CREATED_AT" | "STATUS" | "TRAFFIC_RATIO" | "%future added value";
export type RouteStatus = "FAILED_TO_START" | "PROVISIONING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "%future added value";
export type RouteTrafficStatus = "ACTIVE" | "INACTIVE" | "%future added value";
export type RouteFilter = {
  AND?: ReadonlyArray<RouteFilter> | null | undefined;
  NOT?: ReadonlyArray<RouteFilter> | null | undefined;
  OR?: ReadonlyArray<RouteFilter> | null | undefined;
  healthStatus?: ReadonlyArray<RouteHealthStatus> | null | undefined;
  status?: ReadonlyArray<RouteStatus> | null | undefined;
  trafficStatus?: ReadonlyArray<RouteTrafficStatus> | null | undefined;
};
export type RouteOrderBy = {
  direction?: OrderDirection;
  field: RouteOrderField;
};
export type EndpointDetailPageQuery$variables = {
  autoScalingRules_after?: string | null | undefined;
  autoScalingRules_before?: string | null | undefined;
  autoScalingRules_endpointId: string;
  autoScalingRules_filter?: string | null | undefined;
  autoScalingRules_first?: number | null | undefined;
  autoScalingRules_last?: number | null | undefined;
  autoScalingRules_offset?: number | null | undefined;
  autoScalingRules_order?: string | null | undefined;
  deploymentId: string;
  endpointId: string;
  healthyRouteFilter?: RouteFilter | null | undefined;
  routeFilter?: RouteFilter | null | undefined;
  routeLimit?: number | null | undefined;
  routeOffset?: number | null | undefined;
  routeOrderBy?: ReadonlyArray<RouteOrderBy> | null | undefined;
  skipModelDefinition: boolean;
  skipRouteNodes: boolean;
  skipRoutings: boolean;
  skipScalingRules: boolean;
  tokenListLimit: number;
  tokenListOffset: number;
};
export type EndpointDetailPageQuery$data = {
  readonly endpoint: {
    readonly created_user_email: string | null | undefined;
    readonly endpoint_id: string | null | undefined;
    readonly environ: string | null | undefined;
    readonly errors: ReadonlyArray<{
      readonly session_id: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"InferenceSessionErrorModalFragment">;
    }>;
    readonly extra_mounts: ReadonlyArray<{
      readonly name: string | null | undefined;
      readonly row_id: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonFragment">;
    } | null | undefined> | null | undefined;
    readonly image_object: {
      readonly architecture: string | null | undefined;
      readonly digest: string | null | undefined;
      readonly humanized_name: string | null | undefined;
      readonly is_local: boolean | null | undefined;
      readonly labels: ReadonlyArray<{
        readonly key: string | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
      readonly namespace: string | null | undefined;
      readonly registry: string | null | undefined;
      readonly resource_limits: ReadonlyArray<{
        readonly key: string | null | undefined;
        readonly min: string | null | undefined;
      } | null | undefined> | null | undefined;
      readonly size_bytes: any | null | undefined;
      readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
      readonly tag: string | null | undefined;
      readonly " $fragmentSpreads": FragmentRefs<"ImageNodeSimpleTagFragment">;
    } | null | undefined;
    readonly lifecycle_stage: string | null | undefined;
    readonly model: string | null | undefined;
    readonly model_definition_path: string | null | undefined;
    readonly model_mount_destination: string | null | undefined;
    readonly name: string | null | undefined;
    readonly open_to_public: boolean | null | undefined;
    readonly project: string | null | undefined;
    readonly replicas: number | null | undefined;
    readonly resource_group: string | null | undefined;
    readonly resource_opts: string | null | undefined;
    readonly resource_slots: string | null | undefined;
    readonly retries: number | null | undefined;
    readonly routings: ReadonlyArray<{
      readonly endpoint: string | null | undefined;
      readonly error_data: string | null | undefined;
      readonly routing_id: string | null | undefined;
      readonly session: string | null | undefined;
      readonly status: string | null | undefined;
      readonly traffic_ratio: number | null | undefined;
    } | null | undefined> | null | undefined;
    readonly runtime_variant: {
      readonly human_readable_name: string | null | undefined;
    } | null | undefined;
    readonly status: string | null | undefined;
    readonly url: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"EndpointOwnerInfoFragment" | "EndpointStatusTagFragment" | "ServiceLauncherPageContentFragment">;
  } | null | undefined;
  readonly endpoint_auto_scaling_rules: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly comparator: AutoScalingMetricComparator;
        readonly cooldown_seconds: number;
        readonly created_at: string;
        readonly endpoint: string;
        readonly id: string;
        readonly last_triggered_at: string | null | undefined;
        readonly max_replicas: number | null | undefined;
        readonly metric_name: string;
        readonly metric_source: AutoScalingMetricSource;
        readonly min_replicas: number | null | undefined;
        readonly step_size: number;
        readonly threshold: string;
        readonly " $fragmentSpreads": FragmentRefs<"AutoScalingRuleEditorModalLegacyFragment">;
      } | null | undefined;
    } | null | undefined>;
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly hasPreviousPage: boolean;
    };
  } | null | undefined;
  readonly endpoint_token_list: {
    readonly items: ReadonlyArray<{
      readonly created_at: string;
      readonly domain: string;
      readonly endpoint_id: string;
      readonly id: string | null | undefined;
      readonly project: string;
      readonly session_owner: string;
      readonly token: string;
      readonly valid_until: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
  readonly healthyRoutes: {
    readonly count: number;
  } | null | undefined;
  readonly modelDeployment: {
    readonly currentRevision: {
      readonly id: string;
      readonly modelDefinition: {
        readonly models: ReadonlyArray<{
          readonly modelPath: string;
          readonly name: string;
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
    } | null | undefined;
    readonly metadata: {
      readonly status: DeploymentStatus;
    };
    readonly revisionHistory: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
          readonly modelDefinition: {
            readonly models: ReadonlyArray<{
              readonly modelPath: string;
              readonly name: string;
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
  readonly routes: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIRouteNodesFragment">;
      };
    }>;
  } | null | undefined;
};
export type EndpointDetailPageQuery = {
  response: EndpointDetailPageQuery$data;
  variables: EndpointDetailPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_before"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_endpointId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_filter"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_first"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_last"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_offset"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "autoScalingRules_order"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "deploymentId"
},
v9 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endpointId"
},
v10 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "healthyRouteFilter"
},
v11 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "routeFilter"
},
v12 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "routeLimit"
},
v13 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "routeOffset"
},
v14 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "routeOrderBy"
},
v15 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipModelDefinition"
},
v16 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipRouteNodes"
},
v17 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipRoutings"
},
v18 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipScalingRules"
},
v19 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "tokenListLimit"
},
v20 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "tokenListOffset"
},
v21 = {
  "kind": "Variable",
  "name": "endpoint_id",
  "variableName": "endpointId"
},
v22 = [
  (v21/*: any*/)
],
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lifecycle_stage",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "namespace",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "humanized_name",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_local",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "digest",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimit",
  "kind": "LinkedField",
  "name": "resource_limits",
  "plural": true,
  "selections": [
    (v35/*: any*/),
    (v36/*: any*/)
  ],
  "storageKey": null
},
v38 = [
  (v35/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v39 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "labels",
  "plural": true,
  "selections": (v38/*: any*/),
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "size_bytes",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "supported_accelerators",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "replicas",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "open_to_public",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "session_id",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "retries",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "human_readable_name",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "concreteType": "RuntimeVariantInfo",
  "kind": "LinkedField",
  "name": "runtime_variant",
  "plural": false,
  "selections": [
    (v47/*: any*/)
  ],
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model_mount_destination",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model_definition_path",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "environ",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_group",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_slots",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_opts",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "routing_id",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "session",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "traffic_ratio",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error_data",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_user_email",
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v65 = {
  "alias": null,
  "args": [
    (v21/*: any*/),
    {
      "kind": "Variable",
      "name": "limit",
      "variableName": "tokenListLimit"
    },
    {
      "kind": "Variable",
      "name": "offset",
      "variableName": "tokenListOffset"
    }
  ],
  "concreteType": "EndpointTokenList",
  "kind": "LinkedField",
  "name": "endpoint_token_list",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "total_count",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "EndpointToken",
      "kind": "LinkedField",
      "name": "items",
      "plural": true,
      "selections": [
        (v63/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "token",
          "storageKey": null
        },
        (v26/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "domain",
          "storageKey": null
        },
        (v27/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "session_owner",
          "storageKey": null
        },
        (v64/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "valid_until",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v66 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "autoScalingRules_after"
  },
  {
    "kind": "Variable",
    "name": "before",
    "variableName": "autoScalingRules_before"
  },
  {
    "kind": "Variable",
    "name": "endpoint",
    "variableName": "autoScalingRules_endpointId"
  },
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "autoScalingRules_filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "autoScalingRules_first"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "autoScalingRules_last"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "autoScalingRules_offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "autoScalingRules_order"
  }
],
v67 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasPreviousPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metric_name",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "metric_source",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "threshold",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "comparator",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "step_size",
  "storageKey": null
},
v73 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cooldown_seconds",
  "storageKey": null
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min_replicas",
  "storageKey": null
},
v75 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max_replicas",
  "storageKey": null
},
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "last_triggered_at",
  "storageKey": null
},
v77 = {
  "kind": "Variable",
  "name": "deploymentId",
  "variableName": "deploymentId"
},
v78 = [
  (v77/*: any*/),
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "routeFilter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "routeLimit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "routeOffset"
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "routeOrderBy"
  }
],
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v80 = {
  "alias": "healthyRoutes",
  "args": [
    (v77/*: any*/),
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "healthyRouteFilter"
    }
  ],
  "concreteType": "RouteConnection",
  "kind": "LinkedField",
  "name": "routes",
  "plural": false,
  "selections": [
    (v79/*: any*/)
  ],
  "storageKey": null
},
v81 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
],
v82 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelDeploymentMetadata",
  "kind": "LinkedField",
  "name": "metadata",
  "plural": false,
  "selections": [
    (v24/*: any*/)
  ],
  "storageKey": null
},
v83 = [
  (v63/*: any*/),
  {
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
          (v23/*: any*/),
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
  }
],
v84 = {
  "alias": null,
  "args": null,
  "concreteType": "ModelRevision",
  "kind": "LinkedField",
  "name": "currentRevision",
  "plural": false,
  "selections": (v83/*: any*/),
  "storageKey": null
},
v85 = {
  "alias": null,
  "args": [
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
          "selections": (v83/*: any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "revisionHistory(limit:1,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}])"
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
      (v8/*: any*/),
      (v9/*: any*/),
      (v10/*: any*/),
      (v11/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v14/*: any*/),
      (v15/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v18/*: any*/),
      (v19/*: any*/),
      (v20/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v22/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v23/*: any*/),
          (v24/*: any*/),
          (v25/*: any*/),
          (v26/*: any*/),
          (v27/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageNode",
            "kind": "LinkedField",
            "name": "image_object",
            "plural": false,
            "selections": [
              (v28/*: any*/),
              (v29/*: any*/),
              (v30/*: any*/),
              (v31/*: any*/),
              (v32/*: any*/),
              (v33/*: any*/),
              (v34/*: any*/),
              (v37/*: any*/),
              (v39/*: any*/),
              (v40/*: any*/),
              (v41/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ImageNodeSimpleTagFragment"
              }
            ],
            "storageKey": null
          },
          (v42/*: any*/),
          (v43/*: any*/),
          (v44/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "InferenceSessionError",
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v45/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "InferenceSessionErrorModalFragment"
              }
            ],
            "storageKey": null
          },
          (v46/*: any*/),
          (v48/*: any*/),
          (v49/*: any*/),
          (v50/*: any*/),
          (v51/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderNode",
            "kind": "LinkedField",
            "name": "extra_mounts",
            "plural": true,
            "selections": [
              (v52/*: any*/),
              (v23/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "VFolderNodeIdenticonFragment"
              }
            ],
            "storageKey": null
          },
          (v53/*: any*/),
          (v54/*: any*/),
          (v55/*: any*/),
          (v56/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Routing",
            "kind": "LinkedField",
            "name": "routings",
            "plural": true,
            "selections": [
              (v57/*: any*/),
              (v58/*: any*/),
              (v59/*: any*/),
              (v60/*: any*/),
              (v24/*: any*/),
              (v61/*: any*/)
            ],
            "storageKey": null
          },
          (v62/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "EndpointOwnerInfoFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "EndpointStatusTagFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ServiceLauncherPageContentFragment"
          }
        ],
        "storageKey": null
      },
      (v65/*: any*/),
      {
        "alias": "endpoint_auto_scaling_rules",
        "args": (v66/*: any*/),
        "concreteType": "EndpointAutoScalingRuleConnection",
        "kind": "LinkedField",
        "name": "endpoint_auto_scaling_rule_nodes",
        "plural": false,
        "selections": [
          (v67/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointAutoScalingRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EndpointAutoScalingRuleNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v63/*: any*/),
                  (v60/*: any*/),
                  (v68/*: any*/),
                  (v69/*: any*/),
                  (v70/*: any*/),
                  (v71/*: any*/),
                  (v72/*: any*/),
                  (v73/*: any*/),
                  (v74/*: any*/),
                  (v75/*: any*/),
                  (v64/*: any*/),
                  (v76/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AutoScalingRuleEditorModalLegacyFragment"
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
      {
        "alias": null,
        "args": (v78/*: any*/),
        "concreteType": "RouteConnection",
        "kind": "LinkedField",
        "name": "routes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RouteEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Route",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIRouteNodesFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v79/*: any*/)
        ],
        "storageKey": null
      },
      (v80/*: any*/),
      {
        "alias": "modelDeployment",
        "args": (v81/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v82/*: any*/),
          (v84/*: any*/),
          (v85/*: any*/)
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
      (v9/*: any*/),
      (v20/*: any*/),
      (v19/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v18/*: any*/),
      (v8/*: any*/),
      (v11/*: any*/),
      (v10/*: any*/),
      (v14/*: any*/),
      (v12/*: any*/),
      (v13/*: any*/),
      (v16/*: any*/),
      (v17/*: any*/),
      (v15/*: any*/)
    ],
    "kind": "Operation",
    "name": "EndpointDetailPageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v22/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v23/*: any*/),
          (v24/*: any*/),
          (v25/*: any*/),
          (v26/*: any*/),
          (v27/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageNode",
            "kind": "LinkedField",
            "name": "image_object",
            "plural": false,
            "selections": [
              (v28/*: any*/),
              (v29/*: any*/),
              (v30/*: any*/),
              (v31/*: any*/),
              (v32/*: any*/),
              (v33/*: any*/),
              (v34/*: any*/),
              (v37/*: any*/),
              (v39/*: any*/),
              (v40/*: any*/),
              (v41/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "base_image_name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "version",
                "storageKey": null
              },
              (v23/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "KVPair",
                "kind": "LinkedField",
                "name": "tags",
                "plural": true,
                "selections": (v38/*: any*/),
                "storageKey": null
              },
              (v63/*: any*/)
            ],
            "storageKey": null
          },
          (v42/*: any*/),
          (v43/*: any*/),
          (v44/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "InferenceSessionError",
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v45/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "InferenceSessionErrorInfo",
                "kind": "LinkedField",
                "name": "errors",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "repr",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v46/*: any*/),
          (v48/*: any*/),
          (v49/*: any*/),
          (v50/*: any*/),
          (v51/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderNode",
            "kind": "LinkedField",
            "name": "extra_mounts",
            "plural": true,
            "selections": [
              (v52/*: any*/),
              (v23/*: any*/),
              (v63/*: any*/)
            ],
            "storageKey": null
          },
          (v53/*: any*/),
          (v54/*: any*/),
          (v55/*: any*/),
          (v56/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Routing",
            "kind": "LinkedField",
            "name": "routings",
            "plural": true,
            "selections": [
              (v57/*: any*/),
              (v58/*: any*/),
              (v59/*: any*/),
              (v60/*: any*/),
              (v24/*: any*/),
              (v61/*: any*/),
              (v63/*: any*/)
            ],
            "storageKey": null
          },
          (v62/*: any*/),
          (v63/*: any*/),
          (v62/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "session_owner_email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "desired_session_count",
            "storageKey": null
          },
          (v42/*: any*/),
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
          (v50/*: any*/),
          (v51/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantInfo",
            "kind": "LinkedField",
            "name": "runtime_variant",
            "plural": false,
            "selections": [
              (v23/*: any*/),
              (v47/*: any*/)
            ],
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
              (v63/*: any*/),
              (v52/*: any*/),
              (v23/*: any*/)
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
              (v23/*: any*/),
              (v28/*: any*/),
              (v29/*: any*/),
              (v30/*: any*/),
              (v31/*: any*/),
              (v32/*: any*/),
              (v33/*: any*/),
              (v34/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceLimit",
                "kind": "LinkedField",
                "name": "resource_limits",
                "plural": true,
                "selections": [
                  (v35/*: any*/),
                  (v36/*: any*/),
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
              (v39/*: any*/),
              (v40/*: any*/),
              (v41/*: any*/),
              (v63/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v65/*: any*/),
      {
        "alias": "endpoint_auto_scaling_rules",
        "args": (v66/*: any*/),
        "concreteType": "EndpointAutoScalingRuleConnection",
        "kind": "LinkedField",
        "name": "endpoint_auto_scaling_rule_nodes",
        "plural": false,
        "selections": [
          (v67/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EndpointAutoScalingRuleEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EndpointAutoScalingRuleNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v63/*: any*/),
                  (v60/*: any*/),
                  (v68/*: any*/),
                  (v69/*: any*/),
                  (v70/*: any*/),
                  (v71/*: any*/),
                  (v72/*: any*/),
                  (v73/*: any*/),
                  (v74/*: any*/),
                  (v75/*: any*/),
                  (v64/*: any*/),
                  (v76/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v78/*: any*/),
        "concreteType": "RouteConnection",
        "kind": "LinkedField",
        "name": "routes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RouteEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "Route",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v63/*: any*/),
                  (v24/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "healthStatus",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "trafficRatio",
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
                    "name": "errorData",
                    "storageKey": null
                  },
                  (v58/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "trafficStatus",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v79/*: any*/)
        ],
        "storageKey": null
      },
      (v80/*: any*/),
      {
        "alias": "modelDeployment",
        "args": (v81/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v82/*: any*/),
          (v84/*: any*/),
          (v85/*: any*/),
          (v63/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9af549eddc4f10e8b2132a8d071276c0",
    "id": null,
    "metadata": {},
    "name": "EndpointDetailPageQuery",
    "operationKind": "query",
    "text": "query EndpointDetailPageQuery(\n  $endpointId: UUID!\n  $tokenListOffset: Int!\n  $tokenListLimit: Int!\n  $autoScalingRules_endpointId: String!\n  $autoScalingRules_filter: String\n  $autoScalingRules_offset: Int\n  $autoScalingRules_order: String\n  $autoScalingRules_before: String\n  $autoScalingRules_after: String\n  $autoScalingRules_first: Int\n  $autoScalingRules_last: Int\n  $skipScalingRules: Boolean!\n  $deploymentId: ID!\n  $routeFilter: RouteFilter\n  $healthyRouteFilter: RouteFilter\n  $routeOrderBy: [RouteOrderBy!]\n  $routeLimit: Int\n  $routeOffset: Int\n  $skipRouteNodes: Boolean!\n  $skipRoutings: Boolean!\n  $skipModelDefinition: Boolean!\n) {\n  endpoint(endpoint_id: $endpointId) {\n    name\n    status\n    lifecycle_stage\n    endpoint_id\n    project\n    image_object {\n      namespace\n      humanized_name\n      tag\n      registry\n      architecture\n      is_local\n      digest\n      resource_limits {\n        key\n        min\n      }\n      labels {\n        key\n        value\n      }\n      size_bytes\n      supported_accelerators\n      ...ImageNodeSimpleTagFragment\n      id\n    }\n    replicas\n    url\n    open_to_public\n    errors {\n      session_id\n      ...InferenceSessionErrorModalFragment\n    }\n    retries\n    runtime_variant {\n      human_readable_name\n    }\n    model\n    model_mount_destination\n    model_definition_path\n    extra_mounts {\n      row_id\n      name\n      ...VFolderNodeIdenticonFragment\n      id\n    }\n    environ\n    resource_group\n    resource_slots\n    resource_opts\n    routings @skipOnClient(if: $skipRoutings) {\n      routing_id\n      session\n      traffic_ratio\n      endpoint\n      status\n      error_data\n      id\n    }\n    created_user_email\n    ...EndpointOwnerInfoFragment\n    ...EndpointStatusTagFragment\n    ...ServiceLauncherPageContentFragment\n    id\n  }\n  endpoint_token_list(offset: $tokenListOffset, limit: $tokenListLimit, endpoint_id: $endpointId) {\n    total_count\n    items {\n      id\n      token\n      endpoint_id\n      domain\n      project\n      session_owner\n      created_at\n      valid_until\n    }\n  }\n  endpoint_auto_scaling_rules: endpoint_auto_scaling_rule_nodes(endpoint: $autoScalingRules_endpointId, filter: $autoScalingRules_filter, order: $autoScalingRules_order, offset: $autoScalingRules_offset, before: $autoScalingRules_before, after: $autoScalingRules_after, first: $autoScalingRules_first, last: $autoScalingRules_last) @skipOnClient(if: $skipScalingRules) {\n    pageInfo {\n      hasNextPage\n      hasPreviousPage\n    }\n    edges {\n      node {\n        id\n        endpoint\n        metric_name\n        metric_source\n        threshold\n        comparator\n        step_size\n        cooldown_seconds\n        min_replicas\n        max_replicas\n        created_at\n        last_triggered_at\n        ...AutoScalingRuleEditorModalLegacyFragment\n      }\n    }\n  }\n  routes(deploymentId: $deploymentId, filter: $routeFilter, orderBy: $routeOrderBy, limit: $routeLimit, offset: $routeOffset) @skipOnClient(if: $skipRouteNodes) {\n    edges {\n      node {\n        ...BAIRouteNodesFragment\n        id\n      }\n    }\n    count\n  }\n  healthyRoutes: routes(deploymentId: $deploymentId, filter: $healthyRouteFilter) @skipOnClient(if: $skipRouteNodes) {\n    count\n  }\n  modelDeployment: deployment(id: $deploymentId) @skipOnClient(if: $skipModelDefinition) {\n    metadata {\n      status\n    }\n    currentRevision {\n      id\n      modelDefinition {\n        models {\n          name\n          modelPath\n          service {\n            startCommand\n            port\n            healthCheck {\n              path\n              initialDelay\n              maxRetries\n            }\n          }\n        }\n      }\n    }\n    revisionHistory(limit: 1, orderBy: [{field: CREATED_AT, direction: DESC}]) {\n      edges {\n        node {\n          id\n          modelDefinition {\n            models {\n              name\n              modelPath\n              service {\n                startCommand\n                port\n                healthCheck {\n                  path\n                  initialDelay\n                  maxRetries\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment AutoScalingRuleEditorModalLegacyFragment on EndpointAutoScalingRuleNode {\n  id\n  endpoint\n  metric_name\n  metric_source\n  threshold\n  comparator\n  step_size\n  cooldown_seconds\n  min_replicas\n  max_replicas\n}\n\nfragment BAIRouteNodesFragment on Route {\n  id\n  status\n  healthStatus @since(version: \"26.4.0\")\n  trafficRatio\n  createdAt\n  errorData\n  session\n  trafficStatus\n}\n\nfragment EndpointOwnerInfoFragment on Endpoint {\n  id\n  created_user_email @since(version: \"23.09.8\")\n  session_owner_email @since(version: \"23.09.8\")\n}\n\nfragment EndpointStatusTagFragment on Endpoint {\n  id\n  status\n}\n\nfragment ImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  name\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n\nfragment InferenceSessionErrorModalFragment on InferenceSessionError {\n  session_id\n  errors {\n    repr\n  }\n}\n\nfragment ServiceLauncherPageContentFragment on Endpoint {\n  endpoint_id\n  project\n  desired_session_count @deprecatedSince(version: \"24.12.0\")\n  replicas @since(version: \"24.12.0\")\n  resource_group\n  resource_slots\n  resource_opts\n  cluster_mode\n  cluster_size\n  open_to_public\n  model\n  model_mount_destination @since(version: \"24.03.4\")\n  model_definition_path @since(version: \"24.03.4\")\n  environ\n  runtime_variant @since(version: \"24.03.5\") {\n    name\n    human_readable_name\n  }\n  extra_mounts @since(version: \"24.03.4\") {\n    id\n    row_id\n    name\n  }\n  image_object @since(version: \"23.09.9\") {\n    name @deprecatedSince(version: \"24.12.0\")\n    namespace @since(version: \"24.12.0\")\n    humanized_name\n    tag\n    registry\n    architecture\n    is_local\n    digest\n    resource_limits {\n      key\n      min\n      max\n    }\n    labels {\n      key\n      value\n    }\n    size_bytes\n    supported_accelerators\n    id\n  }\n  name\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n"
  }
};
})();

(node as any).hash = "cbacc6b2e01ea4f4bfd5095da7d12c32";

export default node;
