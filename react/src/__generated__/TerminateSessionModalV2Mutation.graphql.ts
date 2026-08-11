/**
 * @generated SignedSource<<a047bb04b9e3849fcac03e1fdd03446e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TerminateSessionModalV2Mutation$variables = {
  forced: boolean;
  sessionIds: ReadonlyArray<string>;
};
export type TerminateSessionModalV2Mutation$data = {
  readonly terminateSessionsV2: {
    readonly cancelled: ReadonlyArray<string>;
    readonly forceTerminated: ReadonlyArray<string>;
    readonly skipped: ReadonlyArray<string>;
    readonly terminating: ReadonlyArray<string>;
  } | null | undefined;
};
export type TerminateSessionModalV2Mutation = {
  response: TerminateSessionModalV2Mutation$data;
  variables: TerminateSessionModalV2Mutation$variables;
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
    "name": "TerminateSessionModalV2Mutation",
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
    "name": "TerminateSessionModalV2Mutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "53fbd34327b225329fb49f15f9980a01",
    "id": null,
    "metadata": {},
    "name": "TerminateSessionModalV2Mutation",
    "operationKind": "mutation",
    "text": "mutation TerminateSessionModalV2Mutation(\n  $sessionIds: [ID!]!\n  $forced: Boolean!\n) {\n  terminateSessionsV2(sessionIds: $sessionIds, forced: $forced) {\n    cancelled\n    terminating\n    forceTerminated\n    skipped\n  }\n}\n"
  }
};
})();

(node as any).hash = "944b2585ad829431ca3605e9176ca9c7";

export default node;
