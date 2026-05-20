/**
 * @generated SignedSource<<0e3496f7f9300ebbc347e11c43bd84e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectTablePurgeMutation$variables = {
  gid: string;
};
export type BAIProjectTablePurgeMutation$data = {
  readonly purge_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type BAIProjectTablePurgeMutation = {
  response: BAIProjectTablePurgeMutation$data;
  variables: BAIProjectTablePurgeMutation$variables;
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
    "concreteType": "PurgeGroup",
    "kind": "LinkedField",
    "name": "purge_group",
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
    "name": "BAIProjectTablePurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectTablePurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d5fd889b973e684a772c579378656fa3",
    "id": null,
    "metadata": {},
    "name": "BAIProjectTablePurgeMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectTablePurgeMutation(\n  $gid: UUID!\n) {\n  purge_group(gid: $gid) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "cb2d90fcf32999bcb1008e5c90b730fd";

export default node;
