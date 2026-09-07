/**
 * @generated SignedSource<<4352bbb1298149934b9f7b755e9fdce3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManageImageResourceLimitModalTestQuery$variables = Record<PropertyKey, never>;
export type ManageImageResourceLimitModalTestQuery$data = {
  readonly image_node: {
    readonly " $fragmentSpreads": FragmentRefs<"ManageImageResourceLimitModal_image">;
  } | null | undefined;
};
export type ManageImageResourceLimitModalTestQuery = {
  response: ManageImageResourceLimitModalTestQuery$data;
  variables: ManageImageResourceLimitModalTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "test-image-id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ManageImageResourceLimitModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ImageNode",
        "kind": "LinkedField",
        "name": "image_node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ManageImageResourceLimitModal_image"
          }
        ],
        "storageKey": "image_node(id:\"test-image-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ManageImageResourceLimitModalTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ImageNode",
        "kind": "LinkedField",
        "name": "image_node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceLimit",
            "kind": "LinkedField",
            "name": "resource_limits",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "key",
                "storageKey": null
              },
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
            "kind": "ScalarField",
            "name": "registry",
            "storageKey": null
          },
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
            "name": "namespace",
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
            "name": "tag",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "image_node(id:\"test-image-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "fc8b89f21995d85da2ad13b521d50081",
    "id": null,
    "metadata": {},
    "name": "ManageImageResourceLimitModalTestQuery",
    "operationKind": "query",
    "text": "query ManageImageResourceLimitModalTestQuery {\n  image_node(id: \"test-image-id\") {\n    ...ManageImageResourceLimitModal_image\n    id\n  }\n}\n\nfragment ManageImageResourceLimitModal_image on ImageNode {\n  resource_limits {\n    key\n    min\n    max\n  }\n  registry\n  name @deprecatedSince(version: \"24.12.0\")\n  namespace @since(version: \"24.12.0\")\n  architecture\n  tag\n}\n"
  }
};
})();

(node as any).hash = "b069e5eb77648b65a6c575e1f7411585";

export default node;
