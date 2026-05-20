/**
 * @generated SignedSource<<3f5a94c156b55d55c2cf15aa95a982f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomizedImageListUntagMutation$variables = {
  id: string;
};
export type CustomizedImageListUntagMutation$data = {
  readonly untag_image_from_registry: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type CustomizedImageListUntagMutation = {
  response: CustomizedImageListUntagMutation$data;
  variables: CustomizedImageListUntagMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "image_id",
        "variableName": "id"
      }
    ],
    "concreteType": "UntagImageFromRegistry",
    "kind": "LinkedField",
    "name": "untag_image_from_registry",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "CustomizedImageListUntagMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CustomizedImageListUntagMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c71657d2d82d32a7b5b91377f22a41fb",
    "id": null,
    "metadata": {},
    "name": "CustomizedImageListUntagMutation",
    "operationKind": "mutation",
    "text": "mutation CustomizedImageListUntagMutation(\n  $id: String!\n) {\n  untag_image_from_registry(image_id: $id) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "403ccc93953ffe2c119ecfb71a1b8b32";

export default node;
