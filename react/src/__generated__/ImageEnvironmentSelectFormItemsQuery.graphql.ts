/**
 * @generated SignedSource<<7a56c9a082f2cc08ad7586b14c6b1e54>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageEnvironmentSelectFormItemsQuery$variables = {
  installed?: boolean | null | undefined;
};
export type ImageEnvironmentSelectFormItemsQuery$data = {
  readonly images: ReadonlyArray<{
    readonly architecture: string | null | undefined;
    readonly base_image_name: string | null | undefined;
    readonly digest: string | null | undefined;
    readonly humanized_name: string | null | undefined;
    readonly id: string | null | undefined;
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
    readonly supported_accelerators: ReadonlyArray<string | null | undefined> | null | undefined;
    readonly tag: string | null | undefined;
    readonly tags: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly version: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type ImageEnvironmentSelectFormItemsQuery = {
  response: ImageEnvironmentSelectFormItemsQuery$data;
  variables: ImageEnvironmentSelectFormItemsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "installed"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "is_installed",
        "variableName": "installed"
      }
    ],
    "concreteType": "Image",
    "kind": "LinkedField",
    "name": "images",
    "plural": true,
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
        "kind": "ScalarField",
        "name": "name",
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
        "name": "digest",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "installed",
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
          (v1/*: any*/),
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
        "selections": (v2/*: any*/),
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
        "name": "base_image_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "KVPair",
        "kind": "LinkedField",
        "name": "tags",
        "plural": true,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "version",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "supported_accelerators",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ImageEnvironmentSelectFormItemsQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImageEnvironmentSelectFormItemsQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "192812639ccebbee01e918cbd60b8816",
    "id": null,
    "metadata": {},
    "name": "ImageEnvironmentSelectFormItemsQuery",
    "operationKind": "query",
    "text": "query ImageEnvironmentSelectFormItemsQuery(\n  $installed: Boolean\n) {\n  images(is_installed: $installed) {\n    id\n    name @deprecatedSince(version: \"24.12.0\")\n    humanized_name\n    tag\n    registry\n    architecture\n    digest\n    installed\n    resource_limits {\n      key\n      min\n      max\n    }\n    labels {\n      key\n      value\n    }\n    namespace @since(version: \"24.12.0\")\n    base_image_name @since(version: \"24.12.0\")\n    tags @since(version: \"24.12.0\") {\n      key\n      value\n    }\n    version @since(version: \"24.12.0\")\n    supported_accelerators\n  }\n}\n"
  }
};
})();

(node as any).hash = "cd124d0155c7eab304c2d3b6dc75074a";

export default node;
