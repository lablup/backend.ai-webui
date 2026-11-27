/**
 * @generated SignedSource<<1a301a822341e6326ff4b33f398e8eb1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ContainerRegistryListPurgeDomainRegistryRelationMutation$variables = {
  containerRegistryId: string;
  domainId: string;
};
export type ContainerRegistryListPurgeDomainRegistryRelationMutation$data = {
  readonly purgeDomainContainerRegistryRelations: {
    readonly items: ReadonlyArray<{
      readonly containerRegistryId: string;
      readonly domainId: string;
    }>;
  } | null | undefined;
};
export type ContainerRegistryListPurgeDomainRegistryRelationMutation = {
  response: ContainerRegistryListPurgeDomainRegistryRelationMutation$data;
  variables: ContainerRegistryListPurgeDomainRegistryRelationMutation$variables;
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
    "concreteType": "PurgeDomainContainerRegistryRelationsPayload",
    "kind": "LinkedField",
    "name": "purgeDomainContainerRegistryRelations",
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
    "name": "ContainerRegistryListPurgeDomainRegistryRelationMutation",
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
    "name": "ContainerRegistryListPurgeDomainRegistryRelationMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "cd532f63b7426d8c1b5af843dfc90c0e",
    "id": null,
    "metadata": {},
    "name": "ContainerRegistryListPurgeDomainRegistryRelationMutation",
    "operationKind": "mutation",
    "text": "mutation ContainerRegistryListPurgeDomainRegistryRelationMutation(\n  $domainId: UUID!\n  $containerRegistryId: UUID!\n) {\n  purgeDomainContainerRegistryRelations(input: {items: [{domainId: $domainId, containerRegistryId: $containerRegistryId}]}) {\n    items {\n      domainId\n      containerRegistryId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "59111074ee8e04ee54409009c01edac3";

export default node;
