/**
 * @generated SignedSource<<0ae2de11b09d0db4d2472e5b94b8d678>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AddImageModalRegistriesQuery$variables = {
  first?: number | null | undefined;
};
export type AddImageModalRegistriesQuery$data = {
  readonly container_registry_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly type: any;
        readonly url: string;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type AddImageModalRegistriesQuery = {
  response: AddImageModalRegistriesQuery$data;
  variables: AddImageModalRegistriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "first"
      }
    ],
    "concreteType": "ContainerRegistryConnection",
    "kind": "LinkedField",
    "name": "container_registry_nodes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ContainerRegistryEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryNode",
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
                "name": "registry_name",
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
    "name": "AddImageModalRegistriesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AddImageModalRegistriesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8e021c5b1145408f565a466080407dd7",
    "id": null,
    "metadata": {},
    "name": "AddImageModalRegistriesQuery",
    "operationKind": "query",
    "text": "query AddImageModalRegistriesQuery(\n  $first: Int\n) {\n  container_registry_nodes(first: $first) @since(version: \"24.09.0\") {\n    edges {\n      node {\n        id\n        registry_name\n        project\n        url\n        type\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d5c77fee5c4b4ada7a57e563355ce436";

export default node;
