/**
 * @generated SignedSource<<a9cc4086cacc677934ce60376ff76090>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourcePresetListDeleteMutation$variables = {
  id: string;
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
    "name": "id"
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
    "cacheID": "58389c5f66119f423bdc0ab87f80b78b",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetListDeleteMutation(\n  $id: UUID!\n) {\n  delete_resource_preset(id: $id) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "5de901cb26d98b82df1074c65c78c3a1";

export default node;
