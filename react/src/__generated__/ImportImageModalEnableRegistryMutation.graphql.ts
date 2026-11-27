/**
 * @generated SignedSource<<4531198e4c92b2188f7393f3677cdf9d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportImageModalEnableRegistryMutation$variables = {
  containerRegistryId: string;
  domainId: string;
};
export type ImportImageModalEnableRegistryMutation$data = {
  readonly createDomainContainerRegistryRelations: {
    readonly items: ReadonlyArray<{
      readonly containerRegistryId: string;
      readonly domainId: string;
    }>;
  } | null | undefined;
};
export type ImportImageModalEnableRegistryMutation = {
  response: ImportImageModalEnableRegistryMutation$data;
  variables: ImportImageModalEnableRegistryMutation$variables;
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
    "cacheID": "e70c48c4a552db5bfa29141b86030d35",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalEnableRegistryMutation",
    "operationKind": "mutation",
    "text": "mutation ImportImageModalEnableRegistryMutation(\n  $domainId: UUID!\n  $containerRegistryId: UUID!\n) {\n  createDomainContainerRegistryRelations(input: {items: [{domainId: $domainId, containerRegistryId: $containerRegistryId}]}) {\n    items {\n      domainId\n      containerRegistryId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "01d039e0870f60c9549ccb89bf4d298c";

export default node;
