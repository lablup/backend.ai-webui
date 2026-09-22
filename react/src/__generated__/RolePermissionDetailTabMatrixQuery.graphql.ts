/**
 * @generated SignedSource<<d064a83c14f9d875df4ad30ec7155bc3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RolePermissionDetailTabMatrixQuery$variables = Record<PropertyKey, never>;
export type RolePermissionDetailTabMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly scopeType: string;
    readonly " $fragmentSpreads": FragmentRefs<"ScopedRolePermissionCard_rbacPermissionMatrixFragment">;
  }> | null | undefined;
};
export type RolePermissionDetailTabMatrixQuery = {
  response: RolePermissionDetailTabMatrixQuery$data;
  variables: RolePermissionDetailTabMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityOperationCombination",
        "kind": "LinkedField",
        "name": "rbacPermissionMatrix",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ScopedRolePermissionCard_rbacPermissionMatrixFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RolePermissionDetailTabMatrixQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityOperationCombination",
        "kind": "LinkedField",
        "name": "rbacPermissionMatrix",
        "plural": true,
        "selections": [
          (v0/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityActionInfo",
            "kind": "LinkedField",
            "name": "entities",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "OperationInfo",
                "kind": "LinkedField",
                "name": "actions",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "requiredPermission",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0010d510e43785caba131492bc44e146",
    "id": null,
    "metadata": {},
    "name": "RolePermissionDetailTabMatrixQuery",
    "operationKind": "query",
    "text": "query RolePermissionDetailTabMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n    ...ScopedRolePermissionCard_rbacPermissionMatrixFragment\n  }\n}\n\nfragment RoleScopePermissionEditModal_rbacPermissionMatrixFragment on ScopeEntityOperationCombination {\n  scopeType\n  entities {\n    entityType\n    actions {\n      requiredPermission\n    }\n  }\n}\n\nfragment ScopedRolePermissionCard_rbacPermissionMatrixFragment on ScopeEntityOperationCombination {\n  scopeType\n  entities {\n    entityType\n    actions {\n      requiredPermission\n    }\n  }\n  ...RoleScopePermissionEditModal_rbacPermissionMatrixFragment\n}\n"
  }
};
})();

(node as any).hash = "7bc8b4ed1a4b4c7addb69fb3602fa43a";

export default node;
