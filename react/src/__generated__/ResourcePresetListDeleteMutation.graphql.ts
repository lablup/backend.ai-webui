/**
 * @generated SignedSource<<59d02e52b286441c8b3bb678706c63bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourcePresetListDeleteMutation$variables = {
  name: string;
};
export type ResourcePresetListDeleteMutation$data = {
  readonly delete_resource_preset: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourcePresetListDeleteMutation = {
  response: ResourcePresetListDeleteMutation$data;
  variables: ResourcePresetListDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "DeleteResourcePreset",
    "kind": "LinkedField",
    "name": "delete_resource_preset",
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
    "name": "ResourcePresetListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "66d1ae4fe23653f392529fb39e2e61f2",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetListDeleteMutation(\n  $name: String!\n) {\n  delete_resource_preset(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "99b502a95d31e84e4de261e06fb89915";

export default node;
