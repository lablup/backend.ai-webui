/**
 * @generated SignedSource<<53a2b65974aade1c34a92bd4eb2925e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupAlertQuery$variables = {
  projectId: string;
};
export type ProjectResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForProjectV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
};
export type ProjectResourceGroupAlertQuery = {
  response: ProjectResourceGroupAlertQuery$data;
  variables: ProjectResourceGroupAlertQuery$variables;
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
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
    "concreteType": "AllowedResourceGroupsPayload",
    "kind": "LinkedField",
    "name": "adminAllowedResourceGroupsForProjectV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "items",
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
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4631c8604e15edbf253f8e5e426e58c6",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupAlertQuery(\n  $projectId: UUID!\n) {\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) {\n    items\n  }\n}\n"
  }
};
})();

(node as any).hash = "d379a13ca9385077be3af3be60a5133a";

export default node;
