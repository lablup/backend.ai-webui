/**
 * @generated SignedSource<<02cf3435a9237ebf8673deb67575191d>>
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
    "cacheID": "5820a2541e5ea923fd62cf74eb5606d0",
    "id": null,
    "metadata": {},
    "name": "ImageEnvironmentSelectFormItemsQuery",
    "operationKind": "query",
    "text": "query ImageEnvironmentSelectFormItemsQuery(\n  $installed: Boolean\n) {\n  images(is_installed: $installed) {\n    id\n    humanized_name\n    tag\n    registry\n    architecture\n    digest\n    installed\n    resource_limits {\n      key\n      min\n      max\n    }\n    labels {\n      key\n      value\n    }\n    namespace\n    base_image_name\n    tags {\n      key\n      value\n    }\n    version\n    supported_accelerators\n  }\n}\n"
  }
};
})();

(node as any).hash = "6917a0759540c1f399e520a0c6a95664";

export default node;
