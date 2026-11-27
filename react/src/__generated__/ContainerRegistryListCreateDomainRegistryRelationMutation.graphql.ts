/**
 * @generated SignedSource<<04517c2585aa7d2fd394258efe494b64>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListCreateDomainRegistryRelationMutation$variables = {
  containerRegistryId: string;
  domainId: string;
};
export type ContainerRegistryListCreateDomainRegistryRelationMutation$data = {
  readonly createDomainContainerRegistryRelations: {
    readonly items: ReadonlyArray<{
      readonly containerRegistryId: string;
      readonly domainId: string;
    }>;
  } | null | undefined;
};
export type ContainerRegistryListCreateDomainRegistryRelationMutation = {
  response: ContainerRegistryListCreateDomainRegistryRelationMutation$data;
  variables: ContainerRegistryListCreateDomainRegistryRelationMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "containerRegistryId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "items": [
              {
                "fields": [
                  {
                    "kind": "Variable",
                    "name": "containerRegistryId",
                    "variableName": "containerRegistryId"
                  },
                  {
                    "kind": "Variable",
                    "name": "domainId",
                    "variableName": "domainId"
                  }
                ],
                "kind": "ObjectValue",
                "name": "items.0"
              }
            ],
            "kind": "ListValue",
            "name": "items"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "CreateDomainContainerRegistryRelationsPayload",
    "kind": "LinkedField",
    "name": "createDomainContainerRegistryRelations",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "DomainContainerRegistryRelation",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "domainId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "containerRegistryId",
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
    "name": "ContainerRegistryListCreateDomainRegistryRelationMutation",
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
    "name": "ContainerRegistryListCreateDomainRegistryRelationMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "16b0db9f81b5b7f385a39c7a85218f72",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListCreateDomainRegistryRelationMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListCreateDomainRegistryRelationMutation(\n  $domainId: UUID!\n  $containerRegistryId: UUID!\n) {\n  createDomainContainerRegistryRelations(input: {items: [{domainId: $domainId, containerRegistryId: $containerRegistryId}]}) {\n    items {\n      domainId\n      containerRegistryId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8dd0719a11890018e2076f34728b0d55";

export default node;
