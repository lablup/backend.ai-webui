/**
 * @generated SignedSource<<94eef6590dcbc2acd26834056995b5a9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ImageListQuery$variables = {
  filter?: string | null | undefined;
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
        readonly architecture: string | null | undefined;
        readonly base_image_name: string | null | undefined;
        readonly digest: string | null | undefined;
        readonly humanized_name: string | null | undefined;
        readonly id: string;
        readonly installed: boolean | null | undefined;
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
        readonly tag: string | null | undefined;
        readonly tags: ReadonlyArray<{
          readonly key: string | null | undefined;
          readonly value: string | null | undefined;
        } | null | undefined> | null | undefined;
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
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v5 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
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
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "digest",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "installed",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v14 = [
  (v13/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v15 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "labels",
  "plural": true,
  "selections": (v14/*: any*/),
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
  "concreteType": "ResourceLimit",
  "kind": "LinkedField",
  "name": "resource_limits",
  "plural": true,
  "selections": [
    (v13/*: any*/),
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
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "namespace",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "base_image_name",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "tags",
  "plural": true,
  "selections": (v14/*: any*/),
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
},
v22 = {
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
                        "field": (v6/*: any*/),
                        "action": "THROW"
                      },
                      (v7/*: any*/),
                      (v8/*: any*/),
                      (v9/*: any*/),
                      (v10/*: any*/),
                      (v11/*: any*/),
                      (v12/*: any*/),
                      (v15/*: any*/),
                      (v16/*: any*/),
                      (v17/*: any*/),
                      (v18/*: any*/),
                      (v19/*: any*/),
                      (v20/*: any*/),
                      (v21/*: any*/),
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
          (v22/*: any*/)
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
      (v4/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
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
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v15/*: any*/),
                  (v16/*: any*/),
                  (v17/*: any*/),
                  (v18/*: any*/),
                  (v19/*: any*/),
                  (v20/*: any*/),
                  (v21/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v22/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "234827b7fbc4366a772797004142c1df",
    "id": null,
    "metadata": {},
    "name": "ImageListQuery",
    "operationKind": "query",
    "text": "query ImageListQuery(\n  $scopeId: ScopeField!\n  $offset: Int\n  $first: Int\n  $filter: String\n  $order: String\n) {\n  image_nodes(scope_id: $scopeId, offset: $offset, first: $first, filter: $filter, order: $order) {\n    edges {\n      node {\n        id\n        name @deprecatedSince(version: \"24.12.0\")\n        tag\n        registry\n        architecture\n        digest\n        installed\n        labels {\n          key\n          value\n        }\n        humanized_name\n        resource_limits {\n          key\n          min\n          max\n        }\n        namespace @since(version: \"24.12.0\")\n        base_image_name @since(version: \"24.12.0\")\n        tags @since(version: \"24.12.0\") {\n          key\n          value\n        }\n        version @since(version: \"24.12.0\")\n        ...AliasedImageDoubleTagsFragment\n        ...ManageImageResourceLimitModal_image\n        ...ManageAppsModal_image\n      }\n    }\n    count\n  }\n}\n\nfragment AliasedImageDoubleTagsFragment on ImageNode {\n  labels {\n    key\n    value\n  }\n  tags @since(version: \"24.12.0\") {\n    key\n    value\n  }\n}\n\nfragment ManageAppsModal_image on ImageNode {\n  labels {\n    key\n    value\n  }\n  registry\n  name @deprecatedSince(version: \"24.12.0\")\n  namespace @since(version: \"24.12.0\")\n  architecture\n  tag\n}\n\nfragment ManageImageResourceLimitModal_image on ImageNode {\n  resource_limits {\n    key\n    min\n    max\n  }\n  registry\n  name @deprecatedSince(version: \"24.12.0\")\n  namespace @since(version: \"24.12.0\")\n  architecture\n  tag\n}\n"
  }
};
})();

(node as any).hash = "9b1bf944d3bc9e7af6a209a440681040";

export default node;
