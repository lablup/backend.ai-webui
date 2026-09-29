/**
 * @generated SignedSource<<905ba1df3361b25bb114e6f37aaaf607>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ManageImageResourceLimitModalClearMutation$variables = {
  architecture: string;
  imageCanonical: string;
};
export type ManageImageResourceLimitModalClearMutation$data = {
  readonly clear_image_custom_resource_limit: {
    readonly image_node: {
      readonly id: string;
      readonly resource_limits: ReadonlyArray<{
        readonly key: string | null | undefined;
        readonly max: string | null | undefined;
        readonly min: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type ManageImageResourceLimitModalClearMutation = {
  response: ManageImageResourceLimitModalClearMutation$data;
  variables: ManageImageResourceLimitModalClearMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "architecture"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "imageCanonical"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "architecture",
            "variableName": "architecture"
          },
          {
            "kind": "Variable",
            "name": "image_canonical",
            "variableName": "imageCanonical"
          }
        ],
        "kind": "ObjectValue",
        "name": "key"
      }
    ],
    "concreteType": "ClearImageCustomResourceLimitPayload",
    "kind": "LinkedField",
    "name": "clear_image_custom_resource_limit",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageNode",
        "kind": "LinkedField",
        "name": "image_node",
        "plural": false,
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
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ManageImageResourceLimitModalClearMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ManageImageResourceLimitModalClearMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "3fe4120765ba70831db5af50367adb8a",
    "id": null,
    "metadata": {},
    "name": "ManageImageResourceLimitModalClearMutation",
    "operationKind": "mutation",
    "text": "mutation ManageImageResourceLimitModalClearMutation(\n  $imageCanonical: String!\n  $architecture: String!\n) {\n  clear_image_custom_resource_limit(key: {image_canonical: $imageCanonical, architecture: $architecture}) {\n    image_node {\n      id\n      resource_limits {\n        key\n        min\n        max\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d20424ca6ba3d1a9265516d6de73769c";

export default node;
