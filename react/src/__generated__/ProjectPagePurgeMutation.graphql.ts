/**
 * @generated SignedSource<<37c0672a91a98e598a977a98eeeeb3d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectPagePurgeMutation$variables = {
  gid: string;
};
export type ProjectPagePurgeMutation$data = {
  readonly purge_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ProjectPagePurgeMutation = {
  response: ProjectPagePurgeMutation$data;
  variables: ProjectPagePurgeMutation$variables;
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
    "name": "ProjectPagePurgeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectPagePurgeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2b7041be70850a44e664027677b56872",
    "id": null,
    "metadata": {},
    "name": "ProjectPagePurgeMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPagePurgeMutation(\n  $gid: UUID!\n) {\n  purge_group(gid: $gid) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "76ab9c9d44f872f3b6928c61c5bdabb2";

export default node;
