/**
 * @generated SignedSource<<9144bdbeff0d19f1b6cbc286305e10ec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectPageDeactivateMutation$variables = {
  gid: string;
};
export type ProjectPageDeactivateMutation$data = {
  readonly delete_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ProjectPageDeactivateMutation = {
  response: ProjectPageDeactivateMutation$data;
  variables: ProjectPageDeactivateMutation$variables;
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
    "name": "ProjectPageDeactivateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectPageDeactivateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d6ed21e753502936b1809dd7ec534481",
    "id": null,
    "metadata": {},
    "name": "ProjectPageDeactivateMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPageDeactivateMutation(\n  $gid: UUID!\n) {\n  delete_group(gid: $gid) {\n    msg\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "efff8899d9363e384d85951b348bfe03";

export default node;
