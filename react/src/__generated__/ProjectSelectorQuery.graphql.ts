/**
 * @generated SignedSource<<f1e307e971d3ef542439a5905fd43dd4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectSelectorQuery$variables = {
  domain_name?: string | null | undefined;
  email?: string | null | undefined;
  type?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type ProjectSelectorQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
    readonly resource_policy: string | null | undefined;
    readonly type: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly user: {
    readonly groups: ReadonlyArray<{
      readonly id: string | null | undefined;
      readonly name: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ProjectSelectorQuery = {
  response: ProjectSelectorQuery$data;
  variables: ProjectSelectorQuery$variables;
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
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "type"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "domain_name",
      "variableName": "domain_name"
    },
    {
      "kind": "Literal",
      "name": "is_active",
      "value": true
    },
    {
      "kind": "Variable",
      "name": "type",
      "variableName": "type"
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v1/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "is_active",
      "storageKey": null
    },
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "UserGroup",
  "kind": "LinkedField",
  "name": "groups",
  "plural": true,
  "selections": [
    (v1/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectSelectorQuery",
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v5/*: any*/)
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
    "name": "ProjectSelectorQuery",
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "90dcbb57bf23f0a95ae6e5494e83920f",
    "id": null,
    "metadata": {},
    "name": "ProjectSelectorQuery",
    "operationKind": "query",
    "text": "query ProjectSelectorQuery(\n  $domain_name: String\n  $email: String\n  $type: [String]\n) {\n  groups(domain_name: $domain_name, is_active: true, type: $type) {\n    id\n    is_active\n    name\n    resource_policy\n    type\n  }\n  user(email: $email) {\n    groups {\n      id\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "0167dba03af12a144a7f0768d4ea27f0";

export default node;
