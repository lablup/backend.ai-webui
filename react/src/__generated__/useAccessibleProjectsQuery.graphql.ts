/**
 * @generated SignedSource<<319e83b30fe968549a1d919c1543ff69>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAccessibleProjectsQuery$variables = {
  domain_name?: string | null | undefined;
  type?: ReadonlyArray<string | null | undefined> | null | undefined;
};
export type useAccessibleProjectsQuery$data = {
  readonly groups: ReadonlyArray<{
    readonly id: string | null | undefined;
    readonly is_active: boolean | null | undefined;
    readonly name: string | null | undefined;
    readonly resource_policy: string | null | undefined;
    readonly type: string | null | undefined;
  } | null | undefined> | null | undefined;
  readonly myUserV2: {
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly id: string;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
};
export type useAccessibleProjectsQuery = {
  response: useAccessibleProjectsQuery$data;
  variables: useAccessibleProjectsQuery$variables;
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
v3 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "domain_name"
            }
          ],
          "kind": "ObjectValue",
          "name": "domainName"
        },
        {
          "kind": "Literal",
          "name": "isActive",
          "value": true
        }
      ],
      "kind": "ObjectValue",
      "name": "filter"
    },
    {
      "kind": "Literal",
      "name": "limit",
      "value": 1000
    }
  ],
  "concreteType": "ProjectV2Connection",
  "kind": "LinkedField",
  "name": "projects",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useAccessibleProjectsQuery",
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v3/*: any*/)
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
    "name": "useAccessibleProjectsQuery",
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "51e0d5029f46dc3b348a5d8e91eee7e9",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsQuery(\n  $domain_name: String\n  $type: [String]\n) {\n  groups(domain_name: $domain_name, is_active: true, type: $type) {\n    id\n    is_active\n    name\n    resource_policy\n    type\n  }\n  myUserV2 {\n    projects(filter: {isActive: true, domainName: {equals: $domain_name}}, limit: 1000) {\n      edges {\n        node {\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2529c461b1b475abcbaba0d4ea548f0e";

export default node;
