/**
 * @generated SignedSource<<31929a80de802c2e7a88a540b6053909>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIProjectSettingModalQuery$variables = Record<PropertyKey, never>;
export type BAIProjectSettingModalQuery$data = {
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type BAIProjectSettingModalQuery = {
  response: BAIProjectSettingModalQuery$data;
  variables: BAIProjectSettingModalQuery$variables;
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
    "name": "BAIProjectSettingModalQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIProjectSettingModalQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d0b5b19cc1cb5ac1db8a5d5a5ff0c792",
    "id": null,
    "metadata": {},
    "name": "BAIProjectSettingModalQuery",
    "operationKind": "query",
    "text": "query BAIProjectSettingModalQuery {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n}\n"
  }
};
})();

(node as any).hash = "72a77e85e048c7ca8093d9bed774099a";

export default node;
