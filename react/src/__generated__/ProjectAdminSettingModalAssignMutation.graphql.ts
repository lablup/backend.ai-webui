/**
 * @generated SignedSource<<9f295c8f0c68d0dcfc23f8c13064113a>>
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
  readonly adminBulkAssignRole: {
    readonly assigned: ReadonlyArray<{
      readonly id: string;
      readonly userId: string;
    }>;
  } | null | undefined;
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
v1 = [
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
    "name": "adminBulkAssignRole",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "userId",
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
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectAdminSettingModalAssignMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "09d9f12089a2c96ecb53085b5cbb1c9d",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSettingModalAssignMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminSettingModalAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  adminBulkAssignRole(input: $input) {\n    assigned {\n      id\n      userId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4fc0a561f7a656fe3784d9c8f9862438";

export default node;
