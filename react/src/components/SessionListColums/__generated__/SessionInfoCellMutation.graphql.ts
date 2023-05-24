/**
 * @generated SignedSource<<8a92c871a94423bed863cf5c9ba405c0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ModifySessionInput = {
  name: string;
};
export type SessionInfoCellMutation$variables = {
  id: string;
  props: ModifySessionInput;
};
export type SessionInfoCellMutation$data = {
  readonly modify_compute_session: {
    readonly compute_session: {
      readonly id: string | null;
      readonly name: string | null;
    } | null;
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type SessionInfoCellMutation = {
  response: SessionInfoCellMutation$data;
  variables: SessionInfoCellMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
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
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifySession",
    "kind": "LinkedField",
    "name": "modify_compute_session",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "compute_session",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
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
    "name": "SessionInfoCellMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SessionInfoCellMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3f68e6e768a45c9504f9291b7bb1d39c",
    "id": null,
    "metadata": {},
    "name": "SessionInfoCellMutation",
    "operationKind": "mutation",
    "text": "mutation SessionInfoCellMutation(\n  $id: String!\n  $props: ModifySessionInput!\n) {\n  modify_compute_session(id: $id, props: $props) {\n    ok\n    msg\n    compute_session {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6b8c4770a1937752eda4f9744faa75e2";

export default node;
