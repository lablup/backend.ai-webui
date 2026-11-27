/**
 * @generated SignedSource<<ef076dd1486b222dc8bfdfe10fad2434>>
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
export type ManageAppsModalMutation$variables = {
  id: string;
  input: UpdateImageInput;
};
export type ManageAppsModalMutation$data = {
  readonly updateImage: {
    readonly item: {
      readonly id: string;
    };
  };
};
export type ManageAppsModalMutation = {
  response: ManageAppsModalMutation$data;
  variables: ManageAppsModalMutation$variables;
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
    "name": "ManageAppsModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ManageAppsModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f93a70eb20fcd814b7400c0c035fd193",
    "id": null,
    "metadata": {},
    "name": "ManageAppsModalMutation",
    "operationKind": "mutation",
    "text": "mutation ManageAppsModalMutation(\n  $id: UUID!\n  $input: UpdateImageInput!\n) {\n  updateImage(id: $id, input: $input) {\n    item {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28579d8c1eb2396f289771a0f6747cc4";

export default node;
