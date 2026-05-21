/**
 * @generated SignedSource<<58d81875435cd7d6cc98fe54328a4272>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectSessionV2Scope = {
  projectId: string;
};
export type TerminateSessionModalForProjectAdminMutation$variables = {
  forced: boolean;
  scope: ProjectSessionV2Scope;
  sessionIds: ReadonlyArray<string>;
};
export type TerminateSessionModalForProjectAdminMutation$data = {
  readonly terminateProjectSessionsV2: {
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
  "name": "scope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "sessionIds"
},
v3 = [
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
        "name": "scope",
        "variableName": "scope"
      },
      {
        "kind": "Variable",
        "name": "sessionIds",
        "variableName": "sessionIds"
      }
    ],
    "concreteType": "TerminateSessionsPayload",
    "kind": "LinkedField",
    "name": "terminateProjectSessionsV2",
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
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "TerminateSessionModalForProjectAdminMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "20ae557c865eca31dacebcdefd924a82",
    "id": null,
    "metadata": {},
    "name": "TerminateSessionModalForProjectAdminMutation",
    "operationKind": "mutation",
    "text": "mutation TerminateSessionModalForProjectAdminMutation(\n  $scope: ProjectSessionV2Scope!\n  $sessionIds: [ID!]!\n  $forced: Boolean!\n) {\n  terminateProjectSessionsV2(scope: $scope, sessionIds: $sessionIds, forced: $forced) {\n    cancelled\n    terminating\n    forceTerminated\n    skipped\n  }\n}\n"
  }
};
})();

(node as any).hash = "0205d9842816de89483e8953cccceec1";

export default node;
