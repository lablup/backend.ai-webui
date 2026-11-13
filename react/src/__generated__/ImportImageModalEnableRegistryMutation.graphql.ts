/**
 * @generated SignedSource<<e53d8ce31061eb4072a40ab69e1637e6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportImageModalEnableRegistryMutation$variables = {
  allowedDockerRegistries: ReadonlyArray<string>;
  id: string;
};
export type ImportImageModalEnableRegistryMutation$data = {
  readonly updateDomainV2: {
    readonly domain: {
      readonly id: string;
      readonly registry: {
        readonly allowedDockerRegistries: ReadonlyArray<string>;
      };
    };
  };
};
export type ImportImageModalEnableRegistryMutation = {
  response: ImportImageModalEnableRegistryMutation$data;
  variables: ImportImageModalEnableRegistryMutation$variables;
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
    "name": "ImportImageModalEnableRegistryMutation",
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
    "name": "ImportImageModalEnableRegistryMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "016a3b0f97fe913a482bcc9775d35ea9",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalEnableRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ImportImageModalEnableRegistryMutation(\n  $id: UUID!\n  $allowedDockerRegistries: [String!]!\n) {\n  updateDomainV2(id: $id, input: {allowedDockerRegistries: $allowedDockerRegistries}) {\n    domain {\n      id\n      registry {\n        allowedDockerRegistries\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "17fda68aba568a7f945588077d77f758";

export default node;
