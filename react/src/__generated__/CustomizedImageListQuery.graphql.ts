/**
 * @generated SignedSource<<61b0c8548945db7bfa197644463347cc>>
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
    readonly name: string | null | undefined;
    readonly namespace: string | null | undefined;
    readonly registry: string | null | undefined;
    readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly tag: string | null | undefined;
    readonly tags: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly version: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"AliasedImageDoubleTagsFragment">;
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
  "name": "name",
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
            "name": "AliasedImageDoubleTagsFragment"
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
    "cacheID": "9d2e928aef36de71b7da3ce796f74e22",
    "id": null,
    "metadata": {},
    "name": "CustomizedImageListQuery",
    "operationKind": "query",
    "text": "query CustomizedImageListQuery {\n  customized_images {\n    id\n    name @deprecatedSince(version: \"24.12.0\")\n    humanized_name\n    tag\n    registry\n    architecture\n    digest\n    labels {\n      key\n      value\n    }\n    supported_accelerators\n    namespace @since(version: \"24.12.0\")\n    base_image_name @since(version: \"24.12.0\")\n    tags @since(version: \"24.12.0\") {\n      key\n      value\n    }\n    version @since(version: \"24.12.0\")\n    ...AliasedImageDoubleTagsFragment\n  }\n}\n\nfragment AliasedImageDoubleTagsFragment on ImageNode {\n  labels {\n    key\n    value\n  }\n  tags @since(version: \"24.12.0\") {\n    key\n    value\n  }\n}\n"
  }
};
})();

(node as any).hash = "0e0ff40aaf7c9d5c859389b31cd6762a";

export default node;
