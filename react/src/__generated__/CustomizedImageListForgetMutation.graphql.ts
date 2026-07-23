/**
 * @generated SignedSource<<0c77002b198203b41aeb00efad97dd60>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomizedImageListForgetMutation$variables = {
  id: string;
};
export type CustomizedImageListForgetMutation$data = {
  readonly forget_image_by_id: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type CustomizedImageListForgetMutation = {
  response: CustomizedImageListForgetMutation$data;
  variables: CustomizedImageListForgetMutation$variables;
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
    "concreteType": "ForgetImageById",
    "kind": "LinkedField",
    "name": "forget_image_by_id",
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
    "name": "CustomizedImageListForgetMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "CustomizedImageListForgetMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6b517a276517434fdeb129e0535f9519",
    "id": null,
    "metadata": {},
    "name": "CustomizedImageListForgetMutation",
    "operationKind": "mutation",
    "text": "mutation CustomizedImageListForgetMutation(\n  $id: String!\n) {\n  forget_image_by_id(image_id: $id) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "ab2f38ba9700f7c548544a3bc471eb01";

export default node;
