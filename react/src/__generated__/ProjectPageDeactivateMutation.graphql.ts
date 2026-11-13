/**
 * @generated SignedSource<<4350295cb0ac4ee20005f6a285f0e3bd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectPageDeactivateMutation$variables = {
  id: string;
};
export type ProjectPageDeactivateMutation$data = {
  readonly deleteProjectV2: {
    readonly project: {
      readonly id: string;
    };
  };
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
    "concreteType": "DeleteProjectPayload",
    "kind": "LinkedField",
    "name": "deleteProjectV2",
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
    "cacheID": "0396050d7f10e4855578b0bf04ee2c21",
    "id": null,
    "metadata": {},
    "name": "ProjectPageDeactivateMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectPageDeactivateMutation(\n  $id: UUID!\n) {\n  deleteProjectV2(id: $id) {\n    project {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4ce588c13912add6da82cd55be5d43bc";

export default node;
