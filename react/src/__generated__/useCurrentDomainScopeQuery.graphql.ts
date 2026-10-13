/**
 * @generated SignedSource<<7cbafc388a4f2b6ddd16b7173832ba03>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useCurrentDomainScopeQuery$variables = Record<PropertyKey, never>;
export type useCurrentDomainScopeQuery$data = {
  readonly myUserV2: {
    readonly organization: {
      readonly domainId: string | null | undefined;
    };
  } | null | undefined;
};
export type useCurrentDomainScopeQuery = {
  response: useCurrentDomainScopeQuery$data;
  variables: useCurrentDomainScopeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2OrganizationInfo",
  "kind": "LinkedField",
  "name": "organization",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "domainId",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentDomainScopeQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v0/*: any*/)
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
    "name": "useCurrentDomainScopeQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "a9bb4a2c3d0ce69d3fdd0c04d77a2ffd",
    "id": null,
    "metadata": {},
    "name": "useCurrentDomainScopeQuery",
    "operationKind": "query",
    "text": "query useCurrentDomainScopeQuery {\n  myUserV2 {\n    organization {\n      domainId @since(version: \"26.9.0a4\")\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "20900b482a753366954042e6cb4d5a8d";

export default node;
