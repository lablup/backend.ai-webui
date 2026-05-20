/**
 * @generated SignedSource<<e9fa738ab674dc154e6f3afdd93c9ce9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyEndpointInput = {
  cluster_mode?: string | null | undefined;
  cluster_size?: number | null | undefined;
  desired_session_count?: number | null | undefined;
  environ?: string | null | undefined;
  extra_mounts?: ReadonlyArray<ExtraMountInput | null | undefined> | null | undefined;
  image?: ImageRefType | null | undefined;
  model_definition_path?: string | null | undefined;
  name?: string | null | undefined;
  open_to_public?: boolean | null | undefined;
  replicas?: number | null | undefined;
  resource_group?: string | null | undefined;
  resource_opts?: string | null | undefined;
  resource_slots?: string | null | undefined;
  runtime_variant?: string | null | undefined;
};
export type ImageRefType = {
  architecture?: string | null | undefined;
  name: string;
  registry?: string | null | undefined;
};
export type ExtraMountInput = {
  mount_destination?: string | null | undefined;
  permission?: string | null | undefined;
  type?: string | null | undefined;
  vfolder_id?: string | null | undefined;
};
export type ServiceLauncherPageContentModifyMutation$variables = {
  endpoint_id: string;
  props: ModifyEndpointInput;
};
export type ServiceLauncherPageContentModifyMutation$data = {
  readonly modify_endpoint: {
    readonly endpoint: {
      readonly cluster_mode: string | null | undefined;
      readonly cluster_size: number | null | undefined;
      readonly desired_session_count: number | null | undefined;
      readonly endpoint_id: string | null | undefined;
      readonly extra_mounts: ReadonlyArray<{
        readonly cloneable: boolean | null | undefined;
        readonly created_at: string | null | undefined;
        readonly creator: string | null | undefined;
        readonly cur_size: any | null | undefined;
        readonly group: string | null | undefined;
        readonly group_name: string | null | undefined;
        readonly host: string | null | undefined;
        readonly id: string;
        readonly last_used: string | null | undefined;
        readonly max_files: number | null | undefined;
        readonly max_size: any | null | undefined;
        readonly name: string | null | undefined;
        readonly num_files: number | null | undefined;
        readonly ownership_type: string | null | undefined;
        readonly permission: string | null | undefined;
        readonly quota_scope_id: string | null | undefined;
        readonly status: string | null | undefined;
        readonly unmanaged_path: string | null | undefined;
        readonly usage_mode: string | null | undefined;
        readonly user: string | null | undefined;
        readonly user_email: string | null | undefined;
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
        readonly name: string | null | undefined;
        readonly namespace: string | null | undefined;
        readonly registry: string | null | undefined;
        readonly resource_limits: ReadonlyArray<{
          readonly key: string | null | undefined;
          readonly max: string | null | undefined;
          readonly min: string | null | undefined;
        } | null | undefined> | null | undefined;
        readonly size_bytes: any | null | undefined;
        readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
        readonly tag: string | null | undefined;
      } | null | undefined;
      readonly model: string | null | undefined;
      readonly model_definition_path: string | null | undefined;
      readonly model_mount_destination: string | null | undefined;
      readonly name: string | null | undefined;
      readonly open_to_public: boolean | null | undefined;
      readonly replicas: number | null | undefined;
      readonly resource_group: string | null | undefined;
      readonly resource_opts: string | null | undefined;
      readonly resource_slots: string | null | undefined;
      readonly runtime_variant: {
        readonly human_readable_name: string | null | undefined;
        readonly name: string | null | undefined;
      } | null | undefined;
    } | null | undefined;
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ServiceLauncherPageContentModifyMutation = {
  response: ServiceLauncherPageContentModifyMutation$data;
  variables: ServiceLauncherPageContentModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpoint_id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpoint_id"
  },
  {
    "kind": "Variable",
    "name": "props",
    "variableName": "props"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "msg",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "desired_session_count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "replicas",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_group",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_slots",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resource_opts",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_mode",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_size",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "open_to_public",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "namespace",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "humanized_name",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_local",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "digest",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimit",
  "kind": "LinkedField",
  "name": "resource_limits",
  "plural": true,
  "selections": [
    (v22/*: any*/),
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
v24 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "labels",
  "plural": true,
  "selections": [
    (v22/*: any*/),
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
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "size_bytes",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "supported_accelerators",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model_definition_path",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model_mount_destination",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "concreteType": "VirtualFolderNode",
  "kind": "LinkedField",
  "name": "extra_mounts",
  "plural": true,
  "selections": [
    (v29/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "host",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "quota_scope_id",
      "storageKey": null
    },
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "group",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "group_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "creator",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unmanaged_path",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "usage_mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "permission",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ownership_type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_files",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "max_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created_at",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "last_used",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "num_files",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cur_size",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cloneable",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "concreteType": "RuntimeVariantInfo",
  "kind": "LinkedField",
  "name": "runtime_variant",
  "plural": false,
  "selections": [
    (v14/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "human_readable_name",
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
    "name": "ServiceLauncherPageContentModifyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyEndpoint",
        "kind": "LinkedField",
        "name": "modify_endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "endpoint",
            "plural": false,
            "selections": [
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
              {
                "alias": null,
                "args": null,
                "concreteType": "ImageNode",
                "kind": "LinkedField",
                "name": "image_object",
                "plural": false,
                "selections": [
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v23/*: any*/),
                  (v24/*: any*/),
                  (v25/*: any*/),
                  (v26/*: any*/)
                ],
                "storageKey": null
              },
              (v14/*: any*/),
              (v27/*: any*/),
              (v28/*: any*/),
              (v30/*: any*/),
              (v31/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ServiceLauncherPageContentModifyMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModifyEndpoint",
        "kind": "LinkedField",
        "name": "modify_endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "endpoint",
            "plural": false,
            "selections": [
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
              {
                "alias": null,
                "args": null,
                "concreteType": "ImageNode",
                "kind": "LinkedField",
                "name": "image_object",
                "plural": false,
                "selections": [
                  (v14/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v23/*: any*/),
                  (v24/*: any*/),
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v29/*: any*/)
                ],
                "storageKey": null
              },
              (v14/*: any*/),
              (v27/*: any*/),
              (v28/*: any*/),
              (v30/*: any*/),
              (v31/*: any*/),
              (v29/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6e4e20e60305351f47a87be19f8d6a86",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageContentModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ServiceLauncherPageContentModifyMutation(\n  $endpoint_id: UUID!\n  $props: ModifyEndpointInput!\n) {\n  modify_endpoint(endpoint_id: $endpoint_id, props: $props) {\n    ok\n    msg\n    endpoint {\n      endpoint_id\n      desired_session_count @deprecatedSince(version: \"24.12.0\")\n      replicas @since(version: \"24.12.0\")\n      resource_group\n      resource_slots\n      resource_opts\n      cluster_mode\n      cluster_size\n      open_to_public\n      model\n      image_object @since(version: \"23.09.9\") {\n        name @deprecatedSince(version: \"24.12.0\")\n        namespace @since(version: \"24.12.0\")\n        humanized_name\n        tag\n        registry\n        architecture\n        is_local\n        digest\n        resource_limits {\n          key\n          min\n          max\n        }\n        labels {\n          key\n          value\n        }\n        size_bytes\n        supported_accelerators\n        id\n      }\n      name\n      model_definition_path @since(version: \"24.03.4\")\n      model_mount_destination @since(version: \"24.03.4\")\n      extra_mounts @since(version: \"24.03.4\") {\n        id\n        host\n        quota_scope_id\n        name\n        user\n        user_email\n        group\n        group_name\n        creator\n        unmanaged_path\n        usage_mode\n        permission\n        ownership_type\n        max_files\n        max_size\n        created_at\n        last_used\n        num_files\n        cur_size\n        cloneable\n        status\n      }\n      runtime_variant @since(version: \"24.03.5\") {\n        name\n        human_readable_name\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a63a50401ffb00cb96aa893c9536b016";

export default node;
