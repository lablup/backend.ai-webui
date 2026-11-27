/**
 * @generated SignedSource<<b22a9ba84d1a2afb559e6efcbe7bf2c1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type VFolderNodeDescriptionV2LabelsRefreshQuery$variables = {
  vfolderId: string;
};
export type VFolderNodeDescriptionV2LabelsRefreshQuery$data = {
  readonly vfolderV2: {
    readonly entityLabels: {
      readonly " $fragmentSpreads": FragmentRefs<"BAIEntityLabelSettingModalFragment" | "BAIEntityLabelTokensFragment">;
    } | null | undefined;
    readonly id: string;
  } | null | undefined;
};
export type VFolderNodeDescriptionV2LabelsRefreshQuery = {
  response: VFolderNodeDescriptionV2LabelsRefreshQuery$data;
  variables: VFolderNodeDescriptionV2LabelsRefreshQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "vfolderId",
    "variableName": "vfolderId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "VFolderNodeDescriptionV2LabelsRefreshQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": (v3/*: any*/),
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
            "storageKey": "entityLabels(limit:100)"
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
    "name": "VFolderNodeDescriptionV2LabelsRefreshQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VFolder",
        "kind": "LinkedField",
        "name": "vfolderV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": (v3/*: any*/),
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
                      (v2/*: any*/),
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
            "storageKey": "entityLabels(limit:100)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e389a8c254f0441e39ce094268e4ce53",
    "id": null,
    "metadata": {},
    "name": "VFolderNodeDescriptionV2LabelsRefreshQuery",
    "operationKind": "query",
    "text": "query VFolderNodeDescriptionV2LabelsRefreshQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    entityLabels(limit: 100) {\n      ...BAIEntityLabelTokensFragment\n      ...BAIEntityLabelSettingModalFragment\n    }\n  }\n}\n\nfragment BAIEntityLabelSettingModalFragment on EntityLabelConnection {\n  edges {\n    node {\n      fieldId\n      key\n      value\n      id\n    }\n  }\n}\n\nfragment BAIEntityLabelTokensFragment on EntityLabelConnection {\n  edges {\n    node {\n      key\n      value\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "93cbf445442c4636698ea967a8710f21";

export default node;
