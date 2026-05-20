/**
 * @generated SignedSource<<c4abc3049561a173e72900256633ecfb>>
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
export type ManageAppsModalMutation$variables = {
  architecture?: string | null | undefined;
  props: ModifyImageInput;
  target: string;
};
export type ManageAppsModalMutation$data = {
  readonly modify_image: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ManageAppsModalMutation = {
  response: ManageAppsModalMutation$data;
  variables: ManageAppsModalMutation$variables;
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
    "name": "ManageAppsModalMutation",
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
    "name": "ManageAppsModalMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "b7a57119037085ec9f08346991633e0a",
    "id": null,
    "metadata": {},
    "name": "ManageAppsModalMutation",
    "operationKind": "mutation",
    "text": "mutation ManageAppsModalMutation(\n  $target: String!\n  $architecture: String\n  $props: ModifyImageInput!\n) {\n  modify_image(target: $target, architecture: $architecture, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "bb280196745e96f5c488d1d785a5b012";

export default node;
