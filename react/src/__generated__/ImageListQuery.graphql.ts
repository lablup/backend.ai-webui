/**
 * @generated SignedSource<<c5ee083edb800ed160e98dcaf1c874a0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImageStatus = "ALIVE" | "DELETED" | "PURGE_ERROR" | "PURGING" | "%future added value";
export type ImageType = "COMPUTE" | "SERVICE" | "SYSTEM" | "%future added value";
export type ImageListQuery$variables = {
  filter?: string | null | undefined;
  filterByStatuses?: ReadonlyArray<ImageStatus | null | undefined> | null | undefined;
  first?: number | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
  scopeId: any;
};
export type ImageListQuery$data = {
  readonly image_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly aliases: ReadonlyArray<string | null | undefined> | null | undefined;
        readonly architecture: string | null | undefined;
        readonly base_image_name: string | null | undefined;
        readonly digest: string | null | undefined;
        readonly humanized_name: string | null | undefined;
        readonly id: string;
        readonly installed: boolean | null | undefined;
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
        readonly status: string | null | undefined;
        readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
        readonly tag: string | null | undefined;
        readonly tags: ReadonlyArray<{
          readonly key: string | null | undefined;
          readonly value: string | null | undefined;
        } | null | undefined> | null | undefined;
        readonly type: ImageType | null | undefined;
        readonly version: string | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"AliasedImageDoubleTagsFragment" | "ManageAppsModal_image" | "ManageImageResourceLimitModal_image">;
      };
    } | null | undefined>;
  } | null | undefined;
};
export type ImageListQuery = {
  response: ImageListQuery$data;
  variables: ImageListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filterByStatuses"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v6 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "filter_by_statuses",
    "variableName": "filterByStatuses"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
  },
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "scopeId"
  }
],
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
  "name": "name",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "digest",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "installed",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v15 = [
  (v14/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v16 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "labels",
  "plural": true,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "humanized_name",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimit",
  "kind": "LinkedField",
  "name": "resource_limits",
  "plural": true,
  "selections": [
    (v14/*: any*/),
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
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "namespace",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "base_image_name",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "tags",
  "plural": true,
  "selections": (v15/*: any*/),
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "size_bytes",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "is_local",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "supported_accelerators",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "aliases",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "ImageConnection",
        "kind": "LinkedField",
        "name": "image_nodes",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "concreteType": "ImageEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "kind": "RequiredField",
                  "field": {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "kind": "RequiredField",
                        "field": (v7/*: any*/),
                        "action": "THROW"
                      },
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v13/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      (v18/*: any*/),
                      (v19/*: any*/),
                      (v20/*: any*/),
                      (v21/*: any*/),
                      (v22/*: any*/),
                      (v23/*: any*/),
                      (v24/*: any*/),
                      (v25/*: any*/),
                      (v26/*: any*/),
                      (v27/*: any*/),
                      (v28/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "AliasedImageDoubleTagsFragment"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ManageImageResourceLimitModal_image"
                      },
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "ManageAppsModal_image"
                      }
                    ],
                    "storageKey": null
                  },
                  "action": "THROW"
                }
              ],
              "storageKey": null
            },
            "action": "THROW"
          },
          (v29/*: any*/)
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
      (v5/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "ImageConnection",
        "kind": "LinkedField",
        "name": "image_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ImageNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/),
                  (v22/*: any*/),
                  (v23/*: any*/),
                  (v24/*: any*/),
                  (v25/*: any*/),
                  (v26/*: any*/),
                  (v27/*: any*/),
                  (v28/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v29/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "072f7e00d3c1e43fdca63f33a829ea94",
    "id": null,
    "metadata": {},
    "name": "ImageListQuery",
    "operationKind": "query",
    "text": "query ImageListQuery(\n  $scopeId: ScopeField!\n  $offset: Int\n  $first: Int\n  $filter: String\n  $order: String\n  $filterByStatuses: [ImageStatus]\n) {\n  image_nodes(scope_id: $scopeId, offset: $offset, first: $first, filter: $filter, order: $order, filter_by_statuses: $filterByStatuses) {\n    edges {\n      node {\n        id\n        name @deprecatedSince(version: \"24.12.0\")\n        tag\n        registry\n        architecture\n        digest\n        installed\n        labels {\n          key\n          value\n        }\n        humanized_name\n        resource_limits {\n          key\n          min\n          max\n        }\n        namespace @since(version: \"24.12.0\")\n        base_image_name @since(version: \"24.12.0\")\n        tags @since(version: \"24.12.0\") {\n          key\n          value\n        }\n        version @since(version: \"24.12.0\")\n        size_bytes\n        is_local\n        supported_accelerators\n        status @since(version: \"25.4.0\")\n        type @since(version: \"25.12.0\")\n        aliases @since(version: \"24.03.4\")\n        ...AliasedImageDoubleTagsFragment\n        ...ManageImageResourceLimitModal_image\n        ...ManageAppsModal_image\n      }\n    }\n    count\n  }\n}\n\nfragment AliasedImageDoubleTagsFragment on ImageNode {\n  labels {\n    key\n    value\n  }\n  tags @since(version: \"24.12.0\") {\n    key\n    value\n  }\n}\n\nfragment ManageAppsModal_image on ImageNode {\n  labels {\n    key\n    value\n  }\n  registry\n  name @deprecatedSince(version: \"24.12.0\")\n  namespace @since(version: \"24.12.0\")\n  architecture\n  tag\n}\n\nfragment ManageImageResourceLimitModal_image on ImageNode {\n  resource_limits {\n    key\n    min\n    max\n  }\n  registry\n  name @deprecatedSince(version: \"24.12.0\")\n  namespace @since(version: \"24.12.0\")\n  architecture\n  tag\n}\n"
  }
};
})();

(node as any).hash = "0a9ee1e39a2e394686fec139cd4dce00";

export default node;
