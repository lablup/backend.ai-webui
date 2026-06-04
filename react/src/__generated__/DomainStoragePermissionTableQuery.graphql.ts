/**
 * @generated SignedSource<<f9ecd4cb99f7d7ec4b85ea8c6e561ea5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DomainStoragePermissionTableQuery$variables = {
  name: string;
  skip: boolean;
};
export type DomainStoragePermissionTableQuery$data = {
  readonly domain?: {
    readonly allowed_vfolder_hosts: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
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
    "name": "name"
  },
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
            "kind": "Variable",
            "name": "name",
            "variableName": "name"
          }
        ],
        "concreteType": "Domain",
        "kind": "LinkedField",
        "name": "domain",
        "plural": false,
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
        "storageKey": null
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
    "cacheID": "bf86612181b41a47c76fc2eeab7f81da",
    "id": null,
    "metadata": {},
    "name": "DomainStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query DomainStoragePermissionTableQuery(\n  $name: String!\n  $skip: Boolean!\n) {\n  domain(name: $name) @skip(if: $skip) {\n    name\n    allowed_vfolder_hosts\n  }\n}\n"
  }
};
})();

(node as any).hash = "6005d9c92a827f83b65194bae33d6d2c";

export default node;
