/**
 * @generated SignedSource<<8d76d18ca50dc4b99fa3f37cb0661ab3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EndpointSelectTargetProjectQuery$variables = {
  projectId: string;
};
export type EndpointSelectTargetProjectQuery$data = {
  readonly group: {
    readonly id: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type EndpointSelectTargetProjectQuery = {
  response: EndpointSelectTargetProjectQuery$data;
  variables: EndpointSelectTargetProjectQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "projectId"
      }
    ],
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "group",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointSelectTargetProjectQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EndpointSelectTargetProjectQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "911b4c3054035bab7b308181f3ae9994",
    "id": null,
    "metadata": {},
    "name": "EndpointSelectTargetProjectQuery",
    "operationKind": "query",
    "text": "query EndpointSelectTargetProjectQuery(\n  $projectId: UUID!\n) {\n  group(id: $projectId) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "b93d09244b9e981c1a3f9aecc954c5d4";

export default node;
