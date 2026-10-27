/**
 * @generated SignedSource<<a8a1ce3b615ebc6402fa199e7fd22b89>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryType = "DOCKER" | "ECR" | "ECR_PUB" | "GITHUB" | "GITLAB" | "HARBOR" | "HARBOR2" | "LOCAL" | "OCP" | "%future added value";
export type ContainerRegistriesPanelQuery$variables = {
  limit: number;
  offset: number;
};
export type ContainerRegistriesPanelQuery$data = {
  readonly registries: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly isGlobal: boolean | null | undefined;
        readonly project: string | null | undefined;
        readonly registryName: string;
        readonly type: ContainerRegistryType;
        readonly url: string;
      };
    }>;
  } | null | undefined;
};
export type ContainerRegistriesPanelQuery = {
  response: ContainerRegistriesPanelQuery$data;
  variables: ContainerRegistriesPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "alias": "registries",
    "args": [
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      },
      {
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "ASC",
            "field": "REGISTRY_NAME"
          }
        ]
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
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
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
                "name": "registryName",
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
                "name": "isGlobal",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistriesPanelQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ContainerRegistriesPanelQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "97e3842dbda9624e940fb497a295e16c",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistriesPanelQuery",
    "operationKind": "query",
    "text": "query ContainerRegistriesPanelQuery(\n  $limit: Int!\n  $offset: Int!\n) {\n  registries: adminContainerRegistriesV2(orderBy: [{field: REGISTRY_NAME, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        registryName\n        url\n        type\n        project\n        isGlobal\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "115d2bad166635b58a1d0f4ef5d7e200";

export default node;
