/**
 * @generated SignedSource<<1f30eadcf45e7d6fa4ea28370fe6f182>>
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
    "cacheID": "1682c2cadfafd09ca3b4b1317d6a6de2",
    "id": null,
    "metadata": {},
    "name": "ProjectAdminSettingModalAssignMutation",
    "operationKind": "mutation",
    "text": "mutation ProjectAdminSettingModalAssignMutation(\n  $input: BulkAssignRoleInput!\n) {\n  partialBulkAssignRoles(input: $input) {\n    assigned {\n      id\n      userId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "78876bf6c8fcdc49ad2e3d834545876c";

export default node;
