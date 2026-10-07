/**
 * @generated SignedSource<<1bc520c03451867f85825eee1ce1b03a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
export type CreateRoleInput = {
  autoAssign?: boolean;
  description?: string | null | undefined;
  name: string;
  scope?: ScopeInput | null | undefined;
  scopes?: ReadonlyArray<ScopeInput> | null | undefined;
  source?: RoleSource | null | undefined;
};
export type ScopeInput = {
  scopeId: string;
  scopeType: string;
};
export type RoleFormModalCreateMutation$variables = {
  input: CreateRoleInput;
};
export type RoleFormModalCreateMutation$data = {
  readonly adminCreateRole: {
    readonly autoAssign: boolean;
    readonly createdAt: string;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly name: string;
    readonly source: RoleSource;
    readonly status: RoleStatus;
    readonly updatedAt: string;
  } | null | undefined;
};
export type RoleFormModalCreateMutation = {
  response: RoleFormModalCreateMutation$data;
  variables: RoleFormModalCreateMutation$variables;
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
    "concreteType": "Role",
    "kind": "LinkedField",
    "name": "adminCreateRole",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "description",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "source",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "autoAssign",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "createdAt",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "updatedAt",
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
    "name": "RoleFormModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "84f42f3304d32d5014f199055fef1bf8",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation RoleFormModalCreateMutation(\n  $input: CreateRoleInput!\n) {\n  adminCreateRole(input: $input) {\n    id\n    name\n    description\n    source\n    status\n    autoAssign\n    createdAt\n    updatedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc5c0da936725137a3a6ac2990723ae8";

export default node;
