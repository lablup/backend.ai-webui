/**
 * @generated SignedSource<<7b79857a01037b48e3939c0137a27d19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectPageRestoreMutation$variables = {
  id: string;
};
export type ProjectPageRestoreMutation$data = {
  readonly restoreProjectV2: {
    readonly project: {
      readonly id: string;
    };
  };
};
export type ProjectPageRestoreMutation = {
  response: ProjectPageRestoreMutation$data;
  variables: ProjectPageRestoreMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
      }
    ],
    "concreteType": "RestoreProjectPayload",
    "kind": "LinkedField",
    "name": "restoreProjectV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "project",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
    "name": "ProjectPageRestoreMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectPageRestoreMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bf31a8c79a77af64e88487a223c85a14",
    "id": null,
    "metadata": {},
    "name": "ProjectPageRestoreMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPageRestoreMutation(\n  $id: UUID!\n) {\n  restoreProjectV2(id: $id) {\n    project {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "88066541dadb9df1d5e7c4aecdbb9e20";

export default node;
