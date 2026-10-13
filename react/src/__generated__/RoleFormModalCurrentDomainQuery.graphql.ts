/**
 * @generated SignedSource<<dde56e193daa6869e300d23f57c7f000>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalCurrentDomainQuery$variables = {
  domainName: string;
};
export type RoleFormModalCurrentDomainQuery$data = {
  readonly domainV2: {
    readonly entityId: string;
  } | null | undefined;
};
export type RoleFormModalCurrentDomainQuery = {
  response: RoleFormModalCurrentDomainQuery$data;
  variables: RoleFormModalCurrentDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "domainName",
    "variableName": "domainName"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ec8758c159e80d8596fa82f6ef7b46ee",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalCurrentDomainQuery",
    "operationKind": "query",
    "text": "query RoleFormModalCurrentDomainQuery(\n  $domainName: String!\n) {\n  domainV2(domainName: $domainName) {\n    entityId\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c4ee8255cb95c3397f3a11c01f390dc4";

export default node;
