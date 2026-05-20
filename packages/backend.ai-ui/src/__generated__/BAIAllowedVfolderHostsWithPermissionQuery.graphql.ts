/**
 * @generated SignedSource<<68f5187a5d88b14de4fea35c92d83178>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAllowedVfolderHostsWithPermissionQuery$variables = Record<PropertyKey, never>;
export type BAIAllowedVfolderHostsWithPermissionQuery$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type BAIAllowedVfolderHostsWithPermissionQuery = {
  response: BAIAllowedVfolderHostsWithPermissionQuery$data;
  variables: BAIAllowedVfolderHostsWithPermissionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PredefinedAtomicPermission",
    "kind": "LinkedField",
    "name": "vfolder_host_permissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "vfolder_host_permission_list",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAllowedVfolderHostsWithPermissionQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIAllowedVfolderHostsWithPermissionQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "c0663cd792c7e10aaf1f1c8a7a572192",
    "id": null,
    "metadata": {},
    "name": "BAIAllowedVfolderHostsWithPermissionQuery",
    "operationKind": "query",
    "text": "query BAIAllowedVfolderHostsWithPermissionQuery {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "50ff00f392a8e1476b30a736f2c09523";

export default node;
