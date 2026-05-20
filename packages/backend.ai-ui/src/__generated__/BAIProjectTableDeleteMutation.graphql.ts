/**
 * @generated SignedSource<<c44473304604493031780dd3a3f4972c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectTableDeleteMutation$variables = {
  gid: string;
};
export type BAIProjectTableDeleteMutation$data = {
  readonly delete_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectTableDeleteMutation = {
  response: BAIProjectTableDeleteMutation$data;
  variables: BAIProjectTableDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "gid"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "gid",
        "variableName": "gid"
      }
    ],
    "concreteType": "DeleteGroup",
    "kind": "LinkedField",
    "name": "delete_group",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
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
    "name": "BAIProjectTableDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectTableDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a3273c373e5d0024a1b67cc1cf435328",
    "id": null,
    "metadata": {},
    "name": "BAIProjectTableDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectTableDeleteMutation(\n  $gid: UUID!\n) {\n  delete_group(gid: $gid) {\n    msg\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "eec554cf44d6c703eab651f80ec4ccf9";

export default node;
