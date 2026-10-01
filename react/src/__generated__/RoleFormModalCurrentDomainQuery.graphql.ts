/**
 * @generated SignedSource<<ebfe2a5d44189df50e696d234c6b7cd1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalCurrentDomainQuery$variables = {
  domainName: string;
  skipUuid: boolean;
};
export type RoleFormModalCurrentDomainQuery$data = {
  readonly domainV2?: {
    readonly id: string;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipUuid"
  }
],
v1 = [
  {
    "condition": "skipUuid",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domainName",
            "variableName": "domainName"
          }
        ],
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domainV2",
        "plural": false,
        "selections": [
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleFormModalCurrentDomainQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f987a553103a1119f8d35c708e4464e6",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalCurrentDomainQuery",
    "operationKind": "query",
    "text": "query RoleFormModalCurrentDomainQuery(\n  $domainName: String!\n  $skipUuid: Boolean!\n) {\n  domainV2(domainName: $domainName) @skip(if: $skipUuid) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "5cc9b3e612ce29cde3865155ca1695b6";

export default node;
