/**
 * @generated SignedSource<<64d4549f4a3833c7fae6e23930e6ed55>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CustomizedImageListQuery$variables = Record<PropertyKey, never>;
export type CustomizedImageListQuery$data = {
  readonly customized_images: ReadonlyArray<{
    readonly architecture: string | null | undefined;
    readonly base_image_name: string | null | undefined;
    readonly digest: string | null | undefined;
    readonly humanized_name: string | null | undefined;
    readonly id: string;
    readonly labels: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly namespace: string | null | undefined;
    readonly registry: string | null | undefined;
    readonly row_id: string | null | undefined;
    readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly tag: string | null | undefined;
    readonly tags: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly version: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AliasedImageTagTokensFragment">;
  } | null | undefined> | null | undefined;
};
export type CustomizedImageListQuery = {
  response: CustomizedImageListQuery$data;
  variables: CustomizedImageListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "humanized_name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tag",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registry",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "architecture",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "digest",
  "storageKey": null
},
v7 = [
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
    "name": "value",
    "storageKey": null
  }
],
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "labels",
  "plural": true,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "supported_accelerators",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "namespace",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "base_image_name",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "KVPair",
  "kind": "LinkedField",
  "name": "tags",
  "plural": true,
  "selections": (v7/*: any*/),
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "version",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "CustomizedImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageNode",
        "kind": "LinkedField",
        "name": "customized_images",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "AliasedImageTagTokensFragment"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "CustomizedImageListQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageNode",
        "kind": "LinkedField",
        "name": "customized_images",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          (v10/*: any*/),
          (v11/*: any*/),
          (v12/*: any*/),
          (v13/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f9e3c8e5ca8b0990cfea4c88830bd8bf",
    "id": null,
    "metadata": {},
    "name": "CustomizedImageListQuery",
    "operationKind": "query",
    "text": "query CustomizedImageListQuery {\n  customized_images {\n    id\n    row_id\n    humanized_name\n    tag\n    registry\n    architecture\n    digest\n    labels {\n      key\n      value\n    }\n    supported_accelerators\n    namespace\n    base_image_name\n    tags {\n      key\n      value\n    }\n    version\n    ...AliasedImageTagTokensFragment\n  }\n}\n\nfragment AliasedImageTagTokensFragment on ImageNode {\n  labels {\n    key\n    value\n  }\n  tags {\n    key\n    value\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc621202e72fb03507fa8f1622565410";

export default node;
