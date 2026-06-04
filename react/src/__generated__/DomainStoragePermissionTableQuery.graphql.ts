/**
 * @generated SignedSource<<7e327183805cb7429279fc4e1ce7d63e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainStoragePermissionTableQuery$variables = {
  skip: boolean;
};
export type DomainStoragePermissionTableQuery$data = {
  readonly domains?: ReadonlyArray<{
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined> | null | undefined;
};
export type DomainStoragePermissionTableQuery = {
  response: DomainStoragePermissionTableQuery$data;
  variables: DomainStoragePermissionTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "is_active",
            "value": true
          }
        ],
        "concreteType": "Domain",
        "kind": "LinkedField",
        "name": "domains",
        "plural": true,
        "selections": [
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
            "name": "allowed_vfolder_hosts",
            "storageKey": null
          }
        ],
        "storageKey": "domains(is_active:true)"
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DomainStoragePermissionTableQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DomainStoragePermissionTableQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a70e5faa2963f887f536718b6456d3f2",
    "id": null,
    "metadata": {},
    "name": "DomainStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query DomainStoragePermissionTableQuery(\n  $skip: Boolean!\n) {\n  domains(is_active: true) @skip(if: $skip) {\n    name\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "73fabff6e853430d27f6bdcea46a293e";

export default node;
