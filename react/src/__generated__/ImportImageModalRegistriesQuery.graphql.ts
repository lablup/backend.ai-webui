/**
 * @generated SignedSource<<4b8972b54e4a780dd9da13c4e8788056>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryType = "DOCKER" | "ECR" | "ECR_PUB" | "GITHUB" | "GITLAB" | "HARBOR" | "HARBOR2" | "LOCAL" | "OCP" | "%future added value";
export type ImportImageModalRegistriesQuery$variables = {
  after?: string | null | undefined;
  domainName: string;
  first?: number | null | undefined;
};
export type ImportImageModalRegistriesQuery$data = {
  readonly adminContainerRegistriesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly currentDomain: {
          readonly count: number;
        } | null | undefined;
        readonly entityId: string;
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registryName: string;
        readonly type: ContainerRegistryType;
        readonly url: string;
      };
    }>;
    readonly pageInfo: {
      readonly endCursor: string | null | undefined;
      readonly hasNextPage: boolean;
    };
  } | null | undefined;
};
export type ImportImageModalRegistriesQuery = {
  response: ImportImageModalRegistriesQuery$data;
  variables: ImportImageModalRegistriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "after",
        "variableName": "after"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "ContainerRegistryV2Connection",
    "kind": "LinkedField",
    "name": "adminContainerRegistriesV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ContainerRegistryV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryV2",
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
                "kind": "ScalarField",
                "name": "registryName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "project",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "url",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "type",
                "storageKey": null
              },
              {
                "alias": "currentDomain",
                "args": [
                  {
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
                        "name": "name"
                      }
                    ],
                    "kind": "ObjectValue",
                    "name": "filter"
                  }
                ],
                "concreteType": "DomainV2Connection",
                "kind": "LinkedField",
                "name": "domains",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "count",
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
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "PageInfo",
        "kind": "LinkedField",
        "name": "pageInfo",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hasNextPage",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endCursor",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportImageModalRegistriesQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ImportImageModalRegistriesQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "dcf26c924993dff59e860f05ecd8950e",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalRegistriesQuery",
    "operationKind": "query",
    "text": "query ImportImageModalRegistriesQuery(\n  $first: Int\n  $after: String\n  $domainName: String!\n) {\n  adminContainerRegistriesV2(first: $first, after: $after) {\n    edges {\n      node {\n        id\n        entityId\n        registryName\n        project\n        url\n        type\n        currentDomain: domains(filter: {name: {equals: $domainName}}) {\n          count\n        }\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "23a5a86a2aa41f00d3e32349764177d2";

export default node;
