/**
 * @generated SignedSource<<8f21fd709371af239f98dc2556c2d53c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PartialBulkRemoveRolePresetPermissionsInput = {
  ids: ReadonlyArray<string>;
};
export type RolePresetPermissionTableRemoveMutation$variables = {
  input: PartialBulkRemoveRolePresetPermissionsInput;
};
export type RolePresetPermissionTableRemoveMutation$data = {
  readonly partialBulkRemoveRolePresetPermissions: {
    readonly failed: ReadonlyArray<{
      readonly id: string;
      readonly message: string;
    }>;
    readonly successes: ReadonlyArray<{
      readonly id: string;
    }>;
  };
};
export type RolePresetPermissionTableRemoveMutation = {
  response: RolePresetPermissionTableRemoveMutation$data;
  variables: RolePresetPermissionTableRemoveMutation$variables;
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
    "concreteType": "PartialBulkRolePresetPermissionsPayload",
    "kind": "LinkedField",
    "name": "partialBulkRemoveRolePresetPermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RolePermissionPreset",
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
    "name": "RolePresetPermissionTableRemoveMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RolePresetPermissionTableRemoveMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "f00878abe495bbf98a3aba1998c5441d",
    "id": null,
    "metadata": {},
    "name": "RolePresetPermissionTableRemoveMutation",
    "operationKind": "mutation",
    "text": "mutation RolePresetPermissionTableRemoveMutation(\n  $input: PartialBulkRemoveRolePresetPermissionsInput!\n) {\n  partialBulkRemoveRolePresetPermissions(input: $input) {\n    successes {\n      id\n    }\n    failed {\n      id\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2fc727ea4bcd40501c487cd1448229d5";

export default node;
