/**
 * @generated SignedSource<<761c157bd6bf58c6863da654e412775c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ServiceLauncherPageContent_UserInfoQuery$variables = {
  domain_name?: string | null | undefined;
  email?: string | null | undefined;
};
export type ServiceLauncherPageContent_UserInfoQuery$data = {
  readonly user: {
    readonly id: string | null | undefined;
    readonly resource_policy: string | null | undefined;
  } | null | undefined;
};
export type ServiceLauncherPageContent_UserInfoQuery = {
  response: ServiceLauncherPageContent_UserInfoQuery$data;
  variables: ServiceLauncherPageContent_UserInfoQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domain_name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "email"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "domain_name",
        "variableName": "domain_name"
      },
      {
        "kind": "Variable",
        "name": "email",
        "variableName": "email"
      }
    ],
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "user",
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
        "name": "resource_policy",
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
    "name": "ServiceLauncherPageContent_UserInfoQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ServiceLauncherPageContent_UserInfoQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bd463b860cd7ab56a302e7f1dc7b2611",
    "id": null,
    "metadata": {},
    "name": "ServiceLauncherPageContent_UserInfoQuery",
    "operationKind": "query",
    "text": "query ServiceLauncherPageContent_UserInfoQuery(\n  $domain_name: String\n  $email: String\n) {\n  user(domain_name: $domain_name, email: $email) {\n    id\n    resource_policy @since(version: \"23.09.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c33adac7ab1ae44cf36f91363ec7dbf";

export default node;
