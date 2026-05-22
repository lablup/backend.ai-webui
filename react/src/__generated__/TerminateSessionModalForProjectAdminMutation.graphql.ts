/**
 * @generated SignedSource<<bc1c2a7db82d47e4f5977b1c56768d7e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TerminateSessionModalForProjectAdminMutation$variables = {
  forced: boolean;
  sessionIds: ReadonlyArray<string>;
};
export type TerminateSessionModalForProjectAdminMutation$data = {
  readonly terminateSessionsV2: {
    readonly cancelled: ReadonlyArray<string>;
    readonly forceTerminated: ReadonlyArray<string>;
    readonly skipped: ReadonlyArray<string>;
    readonly terminating: ReadonlyArray<string>;
  } | null | undefined;
};
export type TerminateSessionModalForProjectAdminMutation = {
  response: TerminateSessionModalForProjectAdminMutation$data;
  variables: TerminateSessionModalForProjectAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "forced"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sessionIds"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "forced",
        "variableName": "forced"
      },
      {
        "kind": "Variable",
        "name": "sessionIds",
        "variableName": "sessionIds"
      }
    ],
    "concreteType": "TerminateSessionsPayload",
    "kind": "LinkedField",
    "name": "terminateSessionsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cancelled",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "terminating",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "forceTerminated",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "skipped",
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "be4736b37ff54351dd17b8f5d312c2bd",
    "id": null,
    "metadata": {},
    "name": "TerminateSessionModalForProjectAdminMutation",
    "operationKind": "mutation",
    "text": "mutation TerminateSessionModalForProjectAdminMutation(\n  $sessionIds: [ID!]!\n  $forced: Boolean!\n) {\n  terminateSessionsV2(sessionIds: $sessionIds, forced: $forced) {\n    cancelled\n    terminating\n    forceTerminated\n    skipped\n  }\n}\n"
  }
};
})();

(node as any).hash = "8c1ab011f362b60cae0d0e3b7c59bf7e";

export default node;
