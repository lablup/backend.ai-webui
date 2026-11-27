/**
 * @generated SignedSource<<c8961d1c0f3741d189d1a2881ba19bd9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateImageInput = {
  architecture?: string | null | undefined;
  configDigest?: string | null | undefined;
  image?: string | null | undefined;
  isLocal?: boolean | null | undefined;
  labels?: any | null | undefined;
  name?: string | null | undefined;
  registry?: string | null | undefined;
  resourceLimits?: any | null | undefined;
  sizeBytes?: number | null | undefined;
  supportedAccelerators?: string | null | undefined;
  tag?: string | null | undefined;
  type?: string | null | undefined;
};
export type ManageImageResourceLimitModalMutation$variables = {
  id: string;
  input: UpdateImageInput;
};
export type ManageImageResourceLimitModalMutation$data = {
  readonly updateImage: {
    readonly item: {
      readonly id: string;
    };
  };
};
export type ManageImageResourceLimitModalMutation = {
  response: ManageImageResourceLimitModalMutation$data;
  variables: ManageImageResourceLimitModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateImagePayload",
    "kind": "LinkedField",
    "name": "updateImage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ManageImageResourceLimitModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ManageImageResourceLimitModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3570439ebf319cbc8149c89579a7f3c5",
    "id": null,
    "metadata": {},
    "name": "ManageImageResourceLimitModalMutation",
    "operationKind": "mutation",
    "text": "mutation ManageImageResourceLimitModalMutation(\n  $id: UUID!\n  $input: UpdateImageInput!\n) {\n  updateImage(id: $id, input: $input) {\n    item {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e7838b26fdf350015cfb9fd65a5370f7";

export default node;
