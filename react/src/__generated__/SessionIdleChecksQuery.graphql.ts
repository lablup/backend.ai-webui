/**
 * @generated SignedSource<<64a924cf01047f27de8b975b74cb8413>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionIdleChecksQuery$variables = {
  sessionID: string;
};
export type SessionIdleChecksQuery$data = {
  readonly session: {
    readonly id: string | null | undefined;
    readonly idle_checks: string | null | undefined;
  } | null | undefined;
};
export type SessionIdleChecksQuery = {
  response: SessionIdleChecksQuery$data;
  variables: SessionIdleChecksQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "sessionID"
  }
],
v1 = [
  {
    "alias": "session",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "sessionID"
      }
    ],
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
        "name": "idle_checks",
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
    "name": "SessionIdleChecksQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SessionIdleChecksQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6cdc796358ac64699fe0cf2492423e18",
    "id": null,
    "metadata": {},
    "name": "SessionIdleChecksQuery",
    "operationKind": "query",
    "text": "query SessionIdleChecksQuery(\n  $sessionID: UUID!\n) {\n  session: compute_session(id: $sessionID) {\n    id\n    idle_checks @since(version: \"24.09.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "d46ba0743f1bd14d265cddaa3fbeb6c1";

export default node;
