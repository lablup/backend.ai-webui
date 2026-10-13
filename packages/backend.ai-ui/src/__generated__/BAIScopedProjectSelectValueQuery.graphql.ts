/**
 * @generated SignedSource<<d3685ab0eed8aa264b788b489f3aafdd>>
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
export type BAIScopedProjectSelectValueQuery$variables = {
  projectIds: ReadonlyArray<string>;
  scope: ProjectScope;
  skipSelected: boolean;
};
export type BAIScopedProjectSelectValueQuery$data = {
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
export type BAIScopedProjectSelectValueQuery = {
  response: BAIScopedProjectSelectValueQuery$data;
  variables: BAIScopedProjectSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectIds"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
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
          {
            "kind": "Literal",
            "name": "limit",
            "value": 100
          },
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
    "name": "BAIScopedProjectSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIScopedProjectSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "73ae8ea768b65ce1d15746a6fb380893",
    "id": null,
    "metadata": {},
    "name": "BAIScopedProjectSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIScopedProjectSelectValueQuery(\n  $projectIds: [UUID!]!\n  $scope: ProjectScope!\n  $skipSelected: Boolean!\n) {\n  scopedProjectsV2(scope: $scope, filter: {id: {in: $projectIds}}, limit: 100) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        basicInfo {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "101e3ad0ac14de4a3d409274954eff33";

export default node;
