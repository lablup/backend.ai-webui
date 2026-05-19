/**
 * @generated SignedSource<<b9fba35a418c911f43382c57a451c778>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PurgeUserInput = {
  delegate_endpoint_ownership?: boolean | null | undefined;
  purge_shared_vfolders?: boolean | null | undefined;
};
export type PurgeUsersModalMutation$variables = {
  email: string;
  props: PurgeUserInput;
};
export type PurgeUsersModalMutation$data = {
  readonly purge_user: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type PurgeUsersModalMutation = {
  response: PurgeUsersModalMutation$data;
  variables: PurgeUsersModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
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
        "name": "email",
        "variableName": "email"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "PurgeUser",
    "kind": "LinkedField",
    "name": "purge_user",
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
    "name": "PurgeUsersModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PurgeUsersModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "595da6c69d09ff89319849df0acc2143",
    "id": null,
    "metadata": {},
    "name": "PurgeUsersModalMutation",
    "operationKind": "mutation",
    "text": "mutation PurgeUsersModalMutation(\n  $email: String!\n  $props: PurgeUserInput!\n) {\n  purge_user(email: $email, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "56a4331dd3e14bbb16ed0d0cb64294f2";

export default node;
