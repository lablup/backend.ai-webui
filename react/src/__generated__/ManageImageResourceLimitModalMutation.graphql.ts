/**
 * @generated SignedSource<<daec05e36e9df76f871e8a42844384ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyImageInput = {
  architecture?: string | null | undefined;
  digest?: string | null | undefined;
  image?: string | null | undefined;
  is_local?: boolean | null | undefined;
  labels?: ReadonlyArray<KVPairInput | null | undefined> | null | undefined;
  name?: string | null | undefined;
  registry?: string | null | undefined;
  resource_limits?: ReadonlyArray<ResourceLimitInput | null | undefined> | null | undefined;
  size_bytes?: number | null | undefined;
  supported_accelerators?: ReadonlyArray<string | null | undefined> | null | undefined;
  tag?: string | null | undefined;
  type?: string | null | undefined;
};
export type KVPairInput = {
  key?: string | null | undefined;
  value?: string | null | undefined;
};
export type ResourceLimitInput = {
  key?: string | null | undefined;
  max?: string | null | undefined;
  min?: string | null | undefined;
};
export type ManageImageResourceLimitModalMutation$variables = {
  architecture?: string | null | undefined;
  props: ModifyImageInput;
  target: string;
};
export type ManageImageResourceLimitModalMutation$data = {
  readonly modify_image: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ManageImageResourceLimitModalMutation = {
  response: ManageImageResourceLimitModalMutation$data;
  variables: ManageImageResourceLimitModalMutation$variables;
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
  "name": "props"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "target"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "architecture",
        "variableName": "architecture"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      },
      {
        "kind": "Variable",
        "name": "target",
        "variableName": "target"
      }
    ],
    "concreteType": "ModifyImage",
    "kind": "LinkedField",
    "name": "modify_image",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ManageImageResourceLimitModalMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ManageImageResourceLimitModalMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "b4c4a5b17c6aa265df64e4d2d6338684",
    "id": null,
    "metadata": {},
    "name": "ManageImageResourceLimitModalMutation",
    "operationKind": "mutation",
    "text": "mutation ManageImageResourceLimitModalMutation(\n  $target: String!\n  $architecture: String\n  $props: ModifyImageInput!\n) {\n  modify_image(target: $target, architecture: $architecture, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "491b6e500587a3630195d9025ef76f29";

export default node;
