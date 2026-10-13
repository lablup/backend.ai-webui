/**
 * @generated SignedSource<<9d67135641704d5a50540cb2549bd819>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectTypeV2 = "GENERAL" | "MODEL_STORE" | "PERSONAL" | "%future added value";
export type ProjectScope = {
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  resourceGroup?: ReadonlyArray<UUIDScope> | null | undefined;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type useAccessibleProjectsQuery$variables = {
  domainName: string;
  domainScope: ProjectScope;
  isAdmin: boolean;
  types: ReadonlyArray<ProjectTypeV2>;
  userScope: ProjectScope;
};
export type useAccessibleProjectsQuery$data = {
  readonly domainProjects?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
          readonly type: ProjectTypeV2;
        };
        readonly entityId: string;
        readonly id: string;
        readonly lifecycle: {
          readonly isActive: boolean | null | undefined;
        };
        readonly organization: {
          readonly resourcePolicy: string;
        };
      };
    }>;
  } | null | undefined;
  readonly memberProjects: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly basicInfo: {
          readonly name: string;
          readonly type: ProjectTypeV2;
        };
        readonly entityId: string;
        readonly id: string;
        readonly lifecycle: {
          readonly isActive: boolean | null | undefined;
        };
        readonly organization: {
          readonly resourcePolicy: string;
        };
      };
    }>;
  } | null | undefined;
};
export type useAccessibleProjectsQuery = {
  response: useAccessibleProjectsQuery$data;
  variables: useAccessibleProjectsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainScope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isAdmin"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "types"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userScope"
},
v5 = {
  "fields": [
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "equals",
          "variableName": "domainName"
        }
      ],
      "kind": "ObjectValue",
      "name": "domainName"
    },
    {
      "kind": "Literal",
      "name": "isActive",
      "value": true
    },
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "in_",
          "variableName": "types"
        }
      ],
      "kind": "ObjectValue",
      "name": "type"
    }
  ],
  "kind": "ObjectValue",
  "name": "filter"
},
v6 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1000
},
v7 = [
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
            "kind": "ScalarField",
            "name": "entityId",
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
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectOrganizationInfo",
            "kind": "LinkedField",
            "name": "organization",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourcePolicy",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ProjectLifecycleInfo",
            "kind": "LinkedField",
            "name": "lifecycle",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isActive",
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
v8 = [
  {
    "condition": "isAdmin",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "domainProjects",
        "args": [
          (v5/*: any*/),
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "scope",
            "variableName": "domainScope"
          }
        ],
        "concreteType": "ProjectV2Connection",
        "kind": "LinkedField",
        "name": "scopedProjectsV2",
        "plural": false,
        "selections": (v7/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "alias": "memberProjects",
    "args": [
      (v5/*: any*/),
      (v6/*: any*/),
      {
        "kind": "Variable",
        "name": "scope",
        "variableName": "userScope"
      }
    ],
    "concreteType": "ProjectV2Connection",
    "kind": "LinkedField",
    "name": "scopedProjectsV2",
    "plural": false,
    "selections": (v7/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useAccessibleProjectsQuery",
    "selections": (v8/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "useAccessibleProjectsQuery",
    "selections": (v8/*: any*/)
  },
  "params": {
    "cacheID": "0058e3838f7ee69809e565cda218a2c7",
    "id": null,
    "metadata": {},
    "name": "useAccessibleProjectsQuery",
    "operationKind": "query",
    "text": "query useAccessibleProjectsQuery(\n  $domainScope: ProjectScope!\n  $userScope: ProjectScope!\n  $domainName: String!\n  $types: [ProjectTypeV2!]!\n  $isAdmin: Boolean!\n) {\n  domainProjects: scopedProjectsV2(scope: $domainScope, filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, limit: 1000) @include(if: $isAdmin) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n      }\n    }\n  }\n  memberProjects: scopedProjectsV2(scope: $userScope, filter: {isActive: true, domainName: {equals: $domainName}, type: {in_: $types}}, limit: 1000) {\n    edges {\n      node {\n        id\n        entityId\n        basicInfo {\n          name\n          type\n        }\n        organization {\n          resourcePolicy\n        }\n        lifecycle {\n          isActive\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d3c5dd09a515bacc37a3dc37d7023259";

export default node;
