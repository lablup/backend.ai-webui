/**
 * @generated SignedSource<<6a48344fc690be61baaeed2aefecb747>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type BAIAdminProjectSelectValueQuery$variables = {
  projectIds: ReadonlyArray<string>;
  scope: ProjectScope;
  skipAdmin: boolean;
  skipScoped: boolean;
};
export type BAIAdminProjectSelectValueQuery$data = {
  readonly adminProjectsV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
  readonly scopedProjectsV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
        };
        readonly id: string;
      };
    }>;
  } | null | undefined;
};
export type BAIAdminProjectSelectValueQuery = {
  response: BAIAdminProjectSelectValueQuery$data;
  variables: BAIAdminProjectSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectIds"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipAdmin"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipScoped"
},
v4 = {
  "fields": [
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "in",
          "variableName": "projectIds"
        }
      ],
      "kind": "ObjectValue",
      "name": "id"
    }
  ],
  "kind": "ObjectValue",
  "name": "filter"
},
v5 = {
  "kind": "Literal",
  "name": "limit",
  "value": 100
},
v6 = [
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
            "concreteType": "ProjectBasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v7 = [
  {
    "condition": "skipScoped",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "Variable",
            "name": "scope",
            "variableName": "scope"
          }
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "scopedProjectsV2",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "skipAdmin",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "adminProjectsV2",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminProjectSelectValueQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminProjectSelectValueQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "15f9c2c351931838408f4e16e4cff583",
    "id": null,
    "metadata": {},
    "name": "BAIAdminProjectSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminProjectSelectValueQuery(\n  $projectIds: [UUID!]!\n  $scope: ProjectScope!\n  $skipScoped: Boolean!\n  $skipAdmin: Boolean!\n) {\n  scopedProjectsV2(scope: $scope, filter: {id: {in: $projectIds}}, limit: 100) @skip(if: $skipScoped) @since(version: \"26.9.0a4\") {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n  adminProjectsV2(filter: {id: {in: $projectIds}}, limit: 100) @skip(if: $skipAdmin) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2e7f105ffcb1bed403b313eabae29faa";

export default node;
