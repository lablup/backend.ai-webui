/**
 * @generated SignedSource<<5b182c795946f60297c4a81a0749d800>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EntityTarget = {
  entityId: string;
  entityType: string;
};
export type BAIEntityLabelTargetCellQuery$variables = {
  scope: ReadonlyArray<EntityTarget>;
};
export type BAIEntityLabelTargetCellQuery$data = {
  readonly entityLabels: {
    readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelSettingModalFragment" | "BAIEntityLabelTokensFragment">;
  } | null | undefined;
};
export type BAIEntityLabelTargetCellQuery = {
  response: BAIEntityLabelTargetCellQuery$data;
  variables: BAIEntityLabelTargetCellQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
  }
],
v1 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIEntityLabelTargetCellQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityLabelConnection",
        "kind": "LinkedField",
        "name": "entityLabels",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIEntityLabelTokensFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BAIEntityLabelSettingModalFragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIEntityLabelTargetCellQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityLabelConnection",
        "kind": "LinkedField",
        "name": "entityLabels",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityLabelEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityLabel",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "key",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "value",
                    "storageKey": null
                  },
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
                    "name": "fieldId",
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
  },
  "params": {
    "cacheID": "da85370b5fbee3a4d5125f0e691c372e",
    "id": null,
    "metadata": {},
    "name": "BAIEntityLabelTargetCellQuery",
    "operationKind": "query",
    "text": "query BAIEntityLabelTargetCellQuery(\n  $scope: [EntityTarget!]!\n) {\n  entityLabels(scope: $scope, limit: 100) {\n    ...BAIEntityLabelTokensFragment\n    ...BAIEntityLabelSettingModalFragment\n  }\n}\n\nfragment BAIEntityLabelSettingModalFragment on EntityLabelConnection {\n  edges {\n    node {\n      fieldId\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIEntityLabelTokensFragment on EntityLabelConnection {\n  edges {\n    node {\n      key\n      value\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "18dfa7c4e46860362bbe714962ffb5d1";

export default node;
