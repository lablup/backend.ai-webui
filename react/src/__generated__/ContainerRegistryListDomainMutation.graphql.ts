/**
 * @generated SignedSource<<a7e36ce7aa7626cc345670c670eda353>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListDomainMutation$variables = {
  allowedDockerRegistries: ReadonlyArray<string>;
  id: string;
};
export type ContainerRegistryListDomainMutation$data = {
  readonly updateDomainV2: {
    readonly domain: {
      readonly id: string;
      readonly registry: {
        readonly allowedDockerRegistries: ReadonlyArray<string>;
      };
    };
  };
};
export type ContainerRegistryListDomainMutation = {
  response: ContainerRegistryListDomainMutation$data;
  variables: ContainerRegistryListDomainMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allowedDockerRegistries"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "allowedDockerRegistries",
            "variableName": "allowedDockerRegistries"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "DomainPayload",
    "kind": "LinkedField",
    "name": "updateDomainV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DomainV2",
        "kind": "LinkedField",
        "name": "domain",
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
            "concreteType": "DomainRegistryInfo",
            "kind": "LinkedField",
            "name": "registry",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "allowedDockerRegistries",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerRegistryListDomainMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "ContainerRegistryListDomainMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "cec5408bcc7d3f40200da99fe2b687e4",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListDomainMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListDomainMutation(\n  $id: UUID!\n  $allowedDockerRegistries: [String!]!\n) {\n  updateDomainV2(id: $id, input: {allowedDockerRegistries: $allowedDockerRegistries}) {\n    domain {\n      id\n      registry {\n        allowedDockerRegistries\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fe8bb4a26c38c335b3608df2f9650bc1";

export default node;
