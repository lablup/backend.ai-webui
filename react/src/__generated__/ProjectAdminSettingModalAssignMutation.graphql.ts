/**
 * @generated SignedSource<<e7806cf965106e96df5d4230b47bf0cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkAssignRoleInput = {
  projectId?: string | null | undefined;
  roleId: string;
  userIds: ReadonlyArray<string>;
};
export type ProjectAdminSettingModalAssignMutation$variables = {
  input: BulkAssignRoleInput;
};
export type ProjectAdminSettingModalAssignMutation$data = {
  readonly partialBulkAssignRoles: {
    readonly assigned: ReadonlyArray<{
      readonly id: string;
      readonly userId: string;
    }>;
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
  };
};
export type ProjectAdminSettingModalAssignMutation = {
  response: ProjectAdminSettingModalAssignMutation$data;
  variables: ProjectAdminSettingModalAssignMutation$variables;
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
  "name": "userId",
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
    "concreteType": "BulkAssignRolePayload",
    "kind": "LinkedField",
    "name": "partialBulkAssignRoles",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RoleAssignment",
        "kind": "LinkedField",
        "name": "assigned",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkAssignRoleError",
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
    "name": "ProjectAdminSettingModalAssignMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectAdminSettingModalAssignMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "63305f4039b613b045622b9cd46a9f28",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSettingModalAssignMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminSettingModalAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  partialBulkAssignRoles(input: $input) {\n    assigned {\n      id\n      userId\n    }\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "797835a3d0cf313943ba6733d75300c8";

export default node;
