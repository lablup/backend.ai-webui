/**
 * @generated SignedSource<<27a640641d2b11ecb14aa94bc281de5f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkUpdateProjectsInput = {
  items: ReadonlyArray<PartialBulkUpdateProjectItemInput>;
};
export type PartialBulkUpdateProjectItemInput = {
  id: string;
  input: UpdateProjectInput;
};
export type UpdateProjectInput = {
  description?: string | null | undefined;
  integrationName?: string | null | undefined;
  isActive?: boolean | null | undefined;
  name?: string | null | undefined;
  resourcePolicy?: string | null | undefined;
};
export type BAIProjectBulkEditModalProjectMutation$variables = {
  input: PartialBulkUpdateProjectsInput;
};
export type BAIProjectBulkEditModalProjectMutation$data = {
  readonly partialBulkUpdateProjectsV2: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly id: string;
    }>;
  };
};
export type BAIProjectBulkEditModalProjectMutation = {
  response: BAIProjectBulkEditModalProjectMutation$data;
  variables: BAIProjectBulkEditModalProjectMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "PartialBulkProjectsPayload",
    "kind": "LinkedField",
    "name": "partialBulkUpdateProjectsV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "successes",
        "plural": true,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PartialBulkFailure",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "name": "BAIProjectBulkEditModalProjectMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIProjectBulkEditModalProjectMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "7e9c908b74d4c483d68699d851195eef",
    "id": null,
    "metadata": {},
    "name": "BAIProjectBulkEditModalProjectMutation",
    "operationKind": "mutation",
    "text": "mutation BAIProjectBulkEditModalProjectMutation(\n  $input: PartialBulkUpdateProjectsInput!\n) {\n  partialBulkUpdateProjectsV2(input: $input) {\n    successes {\n      id\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cc4fd05715293523cb12284592d64f6e";

export default node;
