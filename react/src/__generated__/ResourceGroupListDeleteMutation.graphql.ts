/**
 * @generated SignedSource<<efe69204cdeff1f49ad41b0b8f11f2ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupListDeleteMutation$variables = {
  name: string;
};
export type ResourceGroupListDeleteMutation$data = {
  readonly delete_scaling_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupListDeleteMutation = {
  response: ResourceGroupListDeleteMutation$data;
  variables: ResourceGroupListDeleteMutation$variables;
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
    "concreteType": "DeleteScalingGroup",
    "kind": "LinkedField",
    "name": "delete_scaling_group",
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
    "name": "ResourceGroupListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "fdcd5026b9668171b8d52998b2c16c6d",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupListDeleteMutation(\n  $name: String!\n) {\n  delete_scaling_group(name: $name) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "40de35d5afd64c8d906e4970b10b722d";

export default node;
